/**
 * CRO OS — GA4 Data Puller
 *
 * Queries the GA4 Data API using a service account to pull all inputs
 * needed for the intent-adjusted benchmark index and onboarding report.
 *
 * Runs as Phase 1.5 in the onboarding workflow, and as a standalone
 * weekly GitHub Action to keep client data fresh.
 *
 * Outputs: clients/[client]/ga4-snapshot.json
 *
 * Requires:
 *   - GCP service account with GA4 Viewer role on the property
 *   - GCP_SERVICE_ACCOUNT_KEY secret (JSON key file contents)
 *   - GA4_PROPERTY_ID in client config.json (format: 123456789)
 *
 * Usage:
 *   node tools/ga4-query.js --client powerleague [--days 90]
 */

const https  = require('https');
const fs     = require('fs');
const path   = require('path');

const CLIENT  = process.argv.includes('--client')
  ? process.argv[process.argv.indexOf('--client') + 1]
  : process.env.CLIENT;

const DAYS = process.argv.includes('--days')
  ? parseInt(process.argv[process.argv.indexOf('--days') + 1])
  : parseInt(process.env.GA4_DAYS || '90');

if (!CLIENT) {
  console.error('Usage: node ga4-query.js --client <slug> [--days 90]');
  process.exit(1);
}

// ── Load client config ────────────────────────────────────────────────────────

const configPath = `clients/${CLIENT}/config.json`;
let config = {};
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch(e) {
  console.error(`Cannot read ${configPath}: ${e.message}`);
  process.exit(1);
}

const GA4_PROPERTY_ID = config.ga4_property_id || process.env.GA4_PROPERTY_ID;
if (!GA4_PROPERTY_ID) {
  console.error(`ga4_property_id not set in ${configPath} and GA4_PROPERTY_ID env var not set.`);
  console.error('Add "ga4_property_id": "123456789" to config.json and re-run.');
  process.exit(1);
}

// ── Service account auth ──────────────────────────────────────────────────────

const SA_KEY_RAW = process.env.GCP_SERVICE_ACCOUNT_KEY;
if (!SA_KEY_RAW) {
  console.error('GCP_SERVICE_ACCOUNT_KEY env var not set.');
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(SA_KEY_RAW);
} catch(e) {
  console.error('GCP_SERVICE_ACCOUNT_KEY is not valid JSON:', e.message);
  process.exit(1);
}

// ── JWT helpers ───────────────────────────────────────────────────────────────

const crypto = require('crypto');

function base64url(buf) {
  return buf.toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}

function makeJWT(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const payload = base64url(Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  })));
  const sigInput = `${header}.${payload}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(sigInput);
  const sig = base64url(sign.sign(sa.private_key));
  return `${sigInput}.${sig}`;
}

function post(host, path, data) {
  return new Promise((resolve, reject) => {
    const body = typeof data === 'string' ? data : JSON.stringify(data);
    const req = https.request({
      hostname: host, path, method: 'POST',
      headers: {
        'Content-Type': typeof data === 'string'
          ? 'application/x-www-form-urlencoded'
          : 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: 30000
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch(e) { reject(new Error(`Parse error: ${d.substring(0,200)}`)); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
    req.write(body);
    req.end();
  });
}

async function getAccessToken(sa) {
  const jwt = makeJWT(sa);
  const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
  const res = await post('oauth2.googleapis.com', '/token', body);
  if (!res.body.access_token) {
    throw new Error('No access token: ' + JSON.stringify(res.body));
  }
  return res.body.access_token;
}

async function ga4Report(propertyId, token, requestBody) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(requestBody);
    const req = https.request({
      hostname: 'analyticsdata.googleapis.com',
      path: `/v1beta/properties/${propertyId}:runReport`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: 30000
    }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch(e) { reject(new Error(`Parse error: ${d.substring(0,200)}`)); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('GA4 API timeout')); });
    req.write(body);
    req.end();
  });
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function dateRange(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  const fmt = d => d.toISOString().split('T')[0];
  return { startDate: fmt(start), endDate: fmt(end) };
}

// ── Parse GA4 report response ─────────────────────────────────────────────────

function parseReport(response) {
  if (response.status !== 200 || !response.body.rows) {
    if (response.body.error) {
      console.warn('  GA4 API error:', response.body.error.message);
    }
    return [];
  }
  const dimHeaders = (response.body.dimensionHeaders || []).map(h => h.name);
  const metHeaders = (response.body.metricHeaders || []).map(h => h.name);
  return (response.body.rows || []).map(row => {
    const obj = {};
    (row.dimensionValues || []).forEach((v, i) => obj[dimHeaders[i]] = v.value);
    (row.metricValues || []).forEach((v, i) => obj[metHeaders[i]] = parseFloat(v.value) || 0);
    return obj;
  });
}

// ── Primary KPIs from config ──────────────────────────────────────────────────

function getPrimaryEvents(cfg) {
  const events = new Set();
  if (cfg.funnels) {
    Object.values(cfg.funnels).forEach(f => {
      if (f.primary_kpi) events.add(f.primary_kpi);
    });
  }
  const vertical = cfg.verticals ? cfg.verticals[0] : cfg.vertical;
  const defaults = {
    leisure: ['purchase', 'begin_checkout'],
    lead_gen: ['generate_lead', 'form_submit'],
    financial_services: ['generate_lead', 'form_submit'],
    ecommerce: ['purchase', 'add_to_cart', 'begin_checkout'],
    saas: ['sign_up', 'trial_start'],
    travel: ['purchase', 'begin_checkout']
  };
  (defaults[vertical] || ['purchase', 'generate_lead']).forEach(e => events.add(e));
  return [...events];
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  const date = new Date().toISOString().split('T')[0];
  const dr = dateRange(DAYS);
  const primaryEvents = getPrimaryEvents(config);
  const verticals = config.verticals || [config.vertical || 'leisure'];

  console.log('\n CRO OS — GA4 Data Puller');
  console.log(` Client:     ${config.client_name || CLIENT}`);
  console.log(` Property:   ${GA4_PROPERTY_ID}`);
  console.log(` Window:     ${DAYS} days (${dr.startDate} → ${dr.endDate})`);
  console.log(` Primary KPIs: ${primaryEvents.join(', ')}\n`);

  // Authenticate
  console.log('Authenticating...');
  const token = await getAccessToken(serviceAccount);
  console.log('Token obtained.\n');

  const snapshot = {
    client: CLIENT,
    ga4_property_id: GA4_PROPERTY_ID,
    pulled_at: new Date().toISOString(),
    date_range: dr,
    days: DAYS,
    verticals,
    queries: {}
  };

  // ── Query 1: Overall sessions + conversions by source/medium ────────────────
  console.log('Query 1/6 — Sessions + conversions by source/medium...');
  const q1 = await ga4Report(GA4_PROPERTY_ID, token, {
    dateRanges: [dr],
    dimensions: [
      { name: 'sessionSourceMedium' },
      { name: 'newVsReturning' },
      { name: 'deviceCategory' }
    ],
    metrics: [
      { name: 'sessions' },
      { name: 'conversions' },
      { name: 'sessionConversionRate' },
      { name: 'bounceRate' },
      { name: 'engagedSessions' }
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 50
  });
  snapshot.queries.sessions_by_segment = parseReport(q1);
  console.log(`  ${snapshot.queries.sessions_by_segment.length} rows`);

  // ── Query 2: Event counts for funnel stages ──────────────────────────────────
  console.log('Query 2/6 — Event counts for funnel stages...');
  const funnelEvents = [...new Set([
    'session_start', 'page_view',
    'view_item', 'view_item_list',
    'select_item', 'add_to_cart',
    'begin_checkout', 'add_payment_info', 'add_shipping_info',
    'purchase', 'generate_lead', 'form_submit', 'sign_up',
    ...primaryEvents
  ])];

  const q2 = await ga4Report(GA4_PROPERTY_ID, token, {
    dateRanges: [dr],
    dimensions: [
      { name: 'eventName' },
      { name: 'sessionSourceMedium' },
      { name: 'newVsReturning' },
      { name: 'deviceCategory' }
    ],
    metrics: [
      { name: 'eventCount' },
      { name: 'sessions' }
    ],
    dimensionFilter: {
      filter: {
        fieldName: 'eventName',
        inListFilter: { values: funnelEvents }
      }
    },
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 200
  });
  snapshot.queries.funnel_events = parseReport(q2);
  console.log(`  ${snapshot.queries.funnel_events.length} rows`);

  // ── Query 3: Landing page performance ────────────────────────────────────────
  console.log('Query 3/6 — Landing page performance...');
  const q3 = await ga4Report(GA4_PROPERTY_ID, token, {
    dateRanges: [dr],
    dimensions: [
      { name: 'landingPagePlusQueryString' },
      { name: 'sessionSourceMedium' }
    ],
    metrics: [
      { name: 'sessions' },
      { name: 'bounceRate' },
      { name: 'engagementRate' },
      { name: 'conversions' }
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 30
  });
  snapshot.queries.landing_pages = parseReport(q3);
  console.log(`  ${snapshot.queries.landing_pages.length} rows`);

  // ── Query 4: New vs returning — sessions + CVR ───────────────────────────────
  console.log('Query 4/6 — New vs returning breakdown...');
  const q4 = await ga4Report(GA4_PROPERTY_ID, token, {
    dateRanges: [dr],
    dimensions: [
      { name: 'newVsReturning' },
      { name: 'deviceCategory' }
    ],
    metrics: [
      { name: 'sessions' },
      { name: 'conversions' },
      { name: 'sessionConversionRate' },
      { name: 'engagedSessions' },
      { name: 'averageSessionDuration' }
    ]
  });
  snapshot.queries.new_vs_returning = parseReport(q4);
  console.log(`  ${snapshot.queries.new_vs_returning.length} rows`);

  // ── Query 5: Weekly trend — sessions + conversions ───────────────────────────
  console.log('Query 5/6 — Weekly trend (last 12 weeks)...');
  const q5 = await ga4Report(GA4_PROPERTY_ID, token, {
    dateRanges: [dateRange(84)],  // 12 weeks
    dimensions: [{ name: 'week' }],
    metrics: [
      { name: 'sessions' },
      { name: 'conversions' },
      { name: 'sessionConversionRate' }
    ],
    orderBys: [{ dimension: { dimensionName: 'week' } }]
  });
  snapshot.queries.weekly_trend = parseReport(q5);
  console.log(`  ${snapshot.queries.weekly_trend.length} rows`);

  // ── Query 6: Channel group performance ──────────────────────────────────────
  console.log('Query 6/6 — Channel group performance...');
  const q6 = await ga4Report(GA4_PROPERTY_ID, token, {
    dateRanges: [dr],
    dimensions: [
      { name: 'sessionDefaultChannelGroup' },
      { name: 'newVsReturning' }
    ],
    metrics: [
      { name: 'sessions' },
      { name: 'conversions' },
      { name: 'sessionConversionRate' },
      { name: 'engagedSessions' }
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
  });
  snapshot.queries.channel_groups = parseReport(q6);
  console.log(`  ${snapshot.queries.channel_groups.length} rows`);

  // ── Compute summary metrics ──────────────────────────────────────────────────

  const allSessions = snapshot.queries.sessions_by_segment;
  const totalSessions = allSessions.reduce((s, r) => s + (r.sessions || 0), 0);
  const totalConversions = allSessions.reduce((s, r) => s + (r.conversions || 0), 0);
  const blendedCVR = totalSessions > 0
    ? Math.round((totalConversions / totalSessions) * 10000) / 100
    : 0;

  const weeklyAvgSessions = snapshot.queries.weekly_trend.length > 0
    ? Math.round(
        snapshot.queries.weekly_trend.reduce((s, r) => s + (r.sessions || 0), 0)
        / snapshot.queries.weekly_trend.length
      )
    : Math.round(totalSessions / (DAYS / 7));

  // Top source/mediums
  const topSources = allSessions
    .sort((a, b) => (b.sessions || 0) - (a.sessions || 0))
    .slice(0, 8)
    .map(r => ({
      source_medium: r.sessionSourceMedium,
      sessions: Math.round(r.sessions || 0),
      conversions: Math.round(r.conversions || 0),
      cvr: Math.round(((r.sessionConversionRate || 0)) * 100) / 100
    }));

  // New vs returning headline
  const nvr = snapshot.queries.new_vs_returning;
  const newRows = nvr.filter(r => r.newVsReturning === 'new');
  const retRows = nvr.filter(r => r.newVsReturning === 'returning');
  const newSessions = newRows.reduce((s, r) => s + (r.sessions || 0), 0);
  const retSessions = retRows.reduce((s, r) => s + (r.sessions || 0), 0);
  const newCVR = newRows.reduce((s, r) => s + (r.conversions || 0), 0) / (newSessions || 1) * 100;
  const retCVR = retRows.reduce((s, r) => s + (r.conversions || 0), 0) / (retSessions || 1) * 100;

  snapshot.summary = {
    period_days: DAYS,
    date_range: dr,
    total_sessions: Math.round(totalSessions),
    total_conversions: Math.round(totalConversions),
    blended_cvr_pct: blendedCVR,
    weekly_avg_sessions: weeklyAvgSessions,
    new_users_pct: Math.round(newSessions / (totalSessions || 1) * 100),
    returning_users_pct: Math.round(retSessions / (totalSessions || 1) * 100),
    new_user_cvr_pct: Math.round(newCVR * 100) / 100,
    returning_user_cvr_pct: Math.round(retCVR * 100) / 100,
    returning_vs_new_cvr_multiplier: newCVR > 0 ? Math.round(retCVR / newCVR * 10) / 10 : null,
    top_sources: topSources,
    primary_kpi_events: primaryEvents,
    mde_note: weeklyAvgSessions < 500
      ? 'LOW TRAFFIC — below 500 sessions/week. MDE will be high. Review segment viability carefully.'
      : weeklyAvgSessions < 2000
      ? 'MEDIUM TRAFFIC — 500–2000 sessions/week. Most segments viable at 12–16 week windows.'
      : 'GOOD TRAFFIC — 2000+ sessions/week. Full segment analysis viable at 8-week windows.'
  };

  // ── Write output ─────────────────────────────────────────────────────────────

  const outPath = `clients/${CLIENT}/ga4-snapshot.json`;
  fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2));

  console.log('\n══════════════════════════════════════════════════════');
  console.log('  GA4 SNAPSHOT COMPLETE');
  console.log('══════════════════════════════════════════════════════');
  console.log(`  Total sessions (${DAYS}d):    ${snapshot.summary.total_sessions.toLocaleString()}`);
  console.log(`  Weekly avg sessions:      ${snapshot.summary.weekly_avg_sessions.toLocaleString()}`);
  console.log(`  Blended CVR:              ${snapshot.summary.blended_cvr_pct}%`);
  console.log(`  New user CVR:             ${snapshot.summary.new_user_cvr_pct}%`);
  console.log(`  Returning user CVR:       ${snapshot.summary.returning_user_cvr_pct}%`);
  console.log(`  Returning/new multiplier: ${snapshot.summary.returning_vs_new_cvr_multiplier}x`);
  console.log(`  Traffic note:             ${snapshot.summary.mde_note}`);
  console.log(`  Saved:                    ${outPath}`);
  console.log('══════════════════════════════════════════════════════\n');
}

run().catch(err => {
  console.error('GA4 query failed:', err.message);
  process.exit(1);
});
