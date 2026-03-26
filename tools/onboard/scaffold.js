/**
 * CRO OS — Client Scaffolder
 * Supports single verticals and composite (multi-funnel) verticals.
 */

const fs = require('fs');

const client = process.env.CLIENT;
const clientName = process.env.CLIENT_NAME;
const url = process.env.URL;
const vertical = process.env.VERTICAL;
const verticals = process.env.VERTICALS ? process.env.VERTICALS.split(',') : [vertical];
const date = new Date().toISOString().split('T')[0];
const isComposite = vertical === 'composite' || verticals.length > 1;

if (!client || !url || !vertical) {
  console.error('Missing required env: CLIENT, URL, VERTICAL');
  process.exit(1);
}

const dir = `clients/${client}`;
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// ── config.json ──────────────────────────────────────────────────────────────
const configPath = `${dir}/config.json`;
if (!fs.existsSync(configPath)) {
  const config = isComposite ? buildCompositeConfig() : buildSingleConfig();
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('Created config.json');
}

// ── context.md ───────────────────────────────────────────────────────────────
const contextPath = `${dir}/context.md`;
if (!fs.existsSync(contextPath)) {
  fs.writeFileSync(contextPath, buildContext());
  console.log('Created context.md');
}

// ── off-limits.md ────────────────────────────────────────────────────────────
const offLimitsPath = `${dir}/off-limits.md`;
if (!fs.existsSync(offLimitsPath)) {
  fs.writeFileSync(offLimitsPath, buildOffLimits());
  console.log('Created off-limits.md');
}

// ── scoring.md ───────────────────────────────────────────────────────────────
const scoringPath = `${dir}/scoring.md`;
if (!fs.existsSync(scoringPath)) {
  fs.writeFileSync(scoringPath, buildScoring());
  console.log('Created scoring.md');
}

console.log(`\nScaffold complete for ${clientName} (${client})`);
if (isComposite) console.log(`Composite vertical: ${verticals.join(' + ')}`);

// ── Builders ─────────────────────────────────────────────────────────────────

function buildSingleConfig() {
  return {
    client_slug: client,
    client_name: clientName,
    extractUrl: url,
    vertical,
    primary_kpi: getPrimaryKpi(vertical),
    onboarded: date,
    qa_selectors: {}
  };
}

function buildCompositeConfig() {
  const funnelDefs = {
    leisure: {
      label: 'Direct booking',
      primary_kpi: 'purchase',
      entry_urls: [],
      description: 'User selects a package, picks date and location, completes payment'
    },
    ecommerce: {
      label: 'Purchase',
      primary_kpi: 'purchase',
      entry_urls: [],
      description: 'User browses products, adds to cart, completes checkout'
    },
    lead_gen: {
      label: 'Lead / enquiry',
      primary_kpi: 'generate_lead',
      entry_urls: [],
      description: 'User submits a form rather than transacting directly'
    },
    financial_services: {
      label: 'Application',
      primary_kpi: 'generate_lead',
      entry_urls: [],
      description: 'User completes an application or enquiry form'
    },
    saas: {
      label: 'Trial signup',
      primary_kpi: 'sign_up',
      entry_urls: [],
      description: 'User signs up for a free trial or demo'
    },
    travel: {
      label: 'Booking',
      primary_kpi: 'purchase',
      entry_urls: [],
      description: 'User searches, selects and completes a booking'
    }
  };

  const funnels = {};
  verticals.forEach((v, i) => {
    const key = i === 0 ? 'transactional' : 'lead';
    funnels[key] = funnelDefs[v] || { label: v, primary_kpi: getPrimaryKpi(v), entry_urls: [], description: '' };
  });

  return {
    client_slug: client,
    client_name: clientName,
    extractUrl: url,
    vertical: 'composite',
    verticals,
    funnels,
    shared_audience: true,
    onboarded: date,
    qa_selectors: {}
  };
}

function buildContext() {
  const funnelSection = isComposite ? `
## Funnel 1 — ${verticals[0]} (transactional)
<!-- Entry points, key pages, known friction -->

## Funnel 2 — ${verticals[1] || 'lead'} (lead / enquiry)
<!-- Entry points, key pages, known friction -->

## How the two funnels relate
<!-- Do users switch between funnels? Is the lead funnel a fallback for the booking funnel? -->
` : `
## Funnel
<!-- Entry points, key pages, known friction -->
`;

  return `# ${clientName} — Client Context

**Vertical:** ${isComposite ? `Composite (${verticals.join(' + ')})` : vertical}
**Primary URL:** ${url}
**Onboarded:** ${date}

## Tech stack
<!-- e.g. WordPress, Next.js, Shopify -->

## Business model
<!-- How does the client make money? -->
${funnelSection}
## VWO status
<!-- Is VWO installed? SmartCode in <head>? Any active tests? -->

## GA4 status
<!-- Installed? Via GTM? Known tracking gaps? -->

## Notes
`;
}

function buildOffLimits() {
  return `# ${clientName} — Off-Limits Rules

## Pricing
<!-- Prices that must not be changed in tests -->

## Legal / regulatory copy
<!-- Regulated text, accreditation claims, T&Cs -->

## Brand partner logos / assets
<!-- Partner-controlled assets -->
${isComposite ? `
## Funnel separation
<!-- Any rules about which funnel users must stay in -->
` : ''}
## Other constraints
`;
}

function buildScoring() {
  const kpiLines = isComposite
    ? verticals.map((v, i) =>
        `primary_kpi_${i === 0 ? 'transactional' : 'lead'}: ${getPrimaryKpi(v)}`
      ).join('\n')
    : `primary_kpi: ${getPrimaryKpi(vertical)}`;

  return `# ${clientName} — Scoring Config

## Conversion weights
potential_weight: 0.33
importance_weight: 0.33
ease_weight: 0.33

## Traffic minimum
min_sessions_per_week: 500

## Seasonal blackouts
blackouts: []

## Vertical
vertical: ${vertical}
${isComposite ? `verticals: ${JSON.stringify(verticals)}` : ''}
${kpiLines}
`;
}

function getPrimaryKpi(v) {
  const m = { leisure: 'purchase', lead_gen: 'generate_lead', ecommerce: 'purchase', financial_services: 'generate_lead', saas: 'sign_up', travel: 'purchase' };
  return m[v] || 'purchase';
}
