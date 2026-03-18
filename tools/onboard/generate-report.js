/**
 * CRO OS — Phase 5: Onboarding Report Generator
 *
 * Reads Phase 1 research.md as its primary input.
 * Sections that Phase 1 already determined (business model, hypotheses,
 * off-limits signals, week 1 priorities) are built on — not re-derived.
 *
 * Inputs (in priority order):
 *   1. research.md          — Phase 1 business understanding (PRIMARY)
 *   2. research-meta.json   — tech stack, vertical, subdomains
 *   3. audit-stage3.csv     — Phase 4 tag audit results
 *   4. design-tokens.md     — Phase 3 CSS extraction
 *   5. brain/ files         — scoring, funnel KPIs, personalisation strategy
 *   6. knowledge-base/      — vertical-specific CRO patterns
 */

const fs   = require('fs');
const path = require('path');

const CLIENT      = process.env.CLIENT;
const CLIENT_NAME = process.env.CLIENT_NAME;
const URL         = process.env.URL;
const date        = new Date().toISOString().split('T')[0];

if (!CLIENT || !CLIENT_NAME) {
  console.error('Missing required env: CLIENT, CLIENT_NAME');
  process.exit(1);
}

const dir = `clients/${CLIENT}`;

// ── File reader ────────────────────────────────────────────────────────────────

function readFile(filePath, fallback = '') {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch(e) {
    return fallback;
  }
}

// ── Load Phase 1 outputs ──────────────────────────────────────────────────────

const researchMd  = readFile(`${dir}/research.md`);
const researchRaw = readFile(`${dir}/research-meta.json`, '{}');
let   meta        = {};
try { meta = JSON.parse(researchRaw); } catch(e) {}

const phase1Complete = meta.phase1_complete === true && researchMd.length > 200;

// Resolve vertical — Phase 1 is authoritative; env var is fallback only
// For composite clients, meta.verticals is an array e.g. ["leisure","lead_gen"]
let verticals = [];
if (meta.verticals && Array.isArray(meta.verticals)) {
  verticals = meta.verticals;
} else if (meta.vertical && meta.vertical !== 'pending_phase1' && meta.vertical !== 'auto') {
  verticals = [meta.vertical];
} else if (process.env.VERTICAL && process.env.VERTICAL !== 'auto') {
  verticals = [process.env.VERTICAL];
} else {
  // Try to read from config.json
  try {
    const cfg = JSON.parse(fs.readFileSync(`${dir}/config.json`, 'utf8'));
    if (cfg.verticals) verticals = cfg.verticals;
    else if (cfg.vertical && cfg.vertical !== 'pending_phase1') verticals = [cfg.vertical];
  } catch(e) {}
}

const isComposite = verticals.length > 1;
const primaryVertical = verticals[0] || 'lead_gen';

console.log(`\n CRO OS — Phase 5: Onboarding Report`);
console.log(` Client:   ${CLIENT_NAME} (${CLIENT})`);
console.log(` Vertical: ${isComposite ? 'composite — ' + verticals.join(' + ') : primaryVertical}`);
console.log(` Phase 1:  ${phase1Complete ? 'complete — building on research.md' : 'not found — deriving from scratch'}\n`);

// ── Load Phase 3 + 4 outputs ──────────────────────────────────────────────────

// Audit: try today's date first, then most recent file
let auditCsv = readFile(`${dir}/audit-stage3-${date}.csv`);
if (!auditCsv) {
  // Find any audit CSV in the client folder
  try {
    const files = fs.readdirSync(dir).filter(f => f.startsWith('audit-stage3') && f.endsWith('.csv'));
    if (files.length > 0) {
      files.sort().reverse(); // most recent first
      auditCsv = readFile(`${dir}/${files[0]}`);
      console.log(` Audit: using ${files[0]}`);
    }
  } catch(e) {}
}
auditCsv = auditCsv || 'Tag audit not yet run — complete Phase 4 before finalising section 2.';

const designTokens = readFile(`${dir}/design-tokens.md`,
  'Design tokens not yet extracted — complete Phase 3 before finalising mockup work.');

const offLimits = readFile(`${dir}/off-limits.md`, '');

// Read GA4 snapshot if available (Phase 1.5 output)
const ga4SnapshotRaw = readFile(`${dir}/ga4-snapshot.json`);
let ga4Summary = '';
let ga4Available = false;
if (ga4SnapshotRaw) {
  try {
    const snap = JSON.parse(ga4SnapshotRaw);
    ga4Available = true;
    const s = snap.summary || {};
    const topSources = (s.top_sources || [])
      .map(r => `  - ${r.source_medium}: ${r.sessions.toLocaleString()} sessions, CVR ${r.cvr}%`)
      .join('\n');
    const nvrRows = (snap.queries && snap.queries.new_vs_returning || [])
      .map(r => `  - ${r.newVsReturning} / ${r.deviceCategory}: ${Math.round(r.sessions)} sessions, CVR ${Math.round((r.sessionConversionRate||0)*10000)/100}%`)
      .join('\n');
    ga4Summary = `## GA4 data snapshot (${snap.days || 90}-day window: ${(snap.date_range||{}).startDate} to ${(snap.date_range||{}).endDate})

REAL DATA — use these numbers directly in the report. Do not use vertical benchmark estimates.

Summary:
- Total sessions: ${(s.total_sessions || 0).toLocaleString()}
- Weekly average sessions: ${(s.weekly_avg_sessions || 0).toLocaleString()}
- Blended CVR: ${s.blended_cvr_pct || 0}%
- New user CVR: ${s.new_user_cvr_pct || 0}%
- Returning user CVR: ${s.returning_user_cvr_pct || 0}%
- Returning/new CVR multiplier: ${s.returning_vs_new_cvr_multiplier || 'unknown'}x
- New users: ${s.new_users_pct || 0}% of sessions
- Traffic assessment: ${s.mde_note || 'unknown'}

Top sources by sessions:
${topSources}

New vs returning by device:
${nvrRows}

Channel groups:
${(snap.queries && snap.queries.channel_groups || []).map(r => `  - ${r.sessionDefaultChannelGroup} / ${r.newVsReturning}: ${Math.round(r.sessions)} sessions, CVR ${Math.round((r.sessionConversionRate||0)*10000)/100}%`).join('\n')}`;
  } catch(e) {
    console.log('Warning: could not parse ga4-snapshot.json:', e.message);
    ga4Summary = 'GA4 snapshot found but could not be parsed — check ga4-snapshot.json format.';
  }
} else {
  ga4Summary = 'GA4 data not available — ga4-snapshot.json not found. Add ga4_property_id to config.json and run the GA4 sync workflow before onboarding for real data. MDE estimates in section 8 will use vertical benchmarks.';
}
console.log(` GA4 data:  ${ga4Available ? 'AVAILABLE — report will use real numbers' : 'not found — using estimates'}\n`);

// ── Load brain files ──────────────────────────────────────────────────────────

const funnelKpis      = readFile('brain/funnel-kpis.md');
const funnelAnalysis  = readFile('brain/funnel-analysis.md');
const scoringModel    = readFile('brain/scoring-model.md');
const personalisation = readFile('brain/personalisation-strategy.md');
const croP            = readFile('brain/cro-principles.md');

// ── Load vertical knowledge bases (all verticals for composite clients) ───────

const verticalMap = {
  leisure:             'leisure-sports',
  lead_gen:            'lead-gen',
  ecommerce:           'ecommerce',
  financial_services:  'financial-services',
  saas:                'saas',
  travel:              'travel'
};

const kbSections = verticals.map(v => {
  const file = verticalMap[v] || v;
  const content = readFile(`knowledge-base/${file}.md`);
  return content
    ? `### Knowledge base — ${v}\n${content}`
    : `### Knowledge base — ${v}\n[Not found — add knowledge-base/${file}.md]`;
}).join('\n\n');

// ── Build the prompt ──────────────────────────────────────────────────────────

const phase1Block = phase1Complete
  ? `## Phase 1 research (PRIMARY INPUT — machine-read the client site):
${researchMd}

Tech stack detected: ${(meta.tech_stack || []).join(', ') || 'see research.md'}
Subdomains found: ${(meta.subdomains || []).join(', ') || 'none'}
Vertical classification: ${isComposite ? 'composite — ' + verticals.join(' + ') : primaryVertical}`

  : `## Phase 1 research: NOT AVAILABLE
Phase 1 research was not completed before this report was generated.
Derive business understanding from the URL and vertical hint only.
URL: ${URL || 'not provided'}
Vertical hint: ${primaryVertical}`;

const compositeNote = isComposite
  ? `\nIMPORTANT — COMPOSITE CLIENT: This client has ${verticals.length} distinct revenue lines (${verticals.join(' + ')}). Every section of the report must treat these as separate funnels. Never blend CVR or metrics across revenue lines. Section 3 must have separate funnel setups for each. Section 6 must have hypotheses across multiple revenue lines. Section 8 MDE must be calculated per revenue line.`
  : '';

const prompt = `You are the CRO OS onboarding system. Produce a comprehensive onboarding report for a new client. This report is saved to the client folder and used as the foundation for all future CRO work.

CLIENT: ${CLIENT_NAME}
URL: ${URL || 'see research.md'}
DATE: ${date}
${compositeNote}

---

${phase1Block}

---

## GA4 data (Phase 1.5):
${ga4Summary}

---

## Tag audit results (Phase 4):
${auditCsv}

---

## Design tokens (Phase 3):
${designTokens}

---

## Off-limits rules:
${offLimits || 'Not yet populated — review research.md section 9 and complete off-limits.md.'}

---

## Vertical knowledge base:
${kbSections}

---

## Brain files (CRO frameworks):

### Funnel KPIs and stage benchmarks:
${funnelKpis}

### Funnel analysis framework:
${funnelAnalysis}

### Scoring model:
${scoringModel}

### CRO principles (Big 10, psychological frameworks, hypothesis justification stats):
${croP}

### Personalisation strategy:
${personalisation}

---

INSTRUCTIONS:

Produce the onboarding report below. Critical rules:
- Be SPECIFIC to this client. Reference actual findings from Phase 1 research, actual audit results, actual URLs. No generic advice.
- Phase 1 is authoritative. Sections 1, 5, 6, 7, 9 MUST build on research.md findings — do not re-derive what Phase 1 already determined. Reference it explicitly ("Phase 1 identified...", "research.md section 7 flags...").
- GA4 data is ground truth. If GA4 snapshot data is available (marked REAL DATA), use those exact numbers in sections 5, 6, 8 and 10. Do not substitute vertical benchmark estimates when real data exists. State the actual weekly session count, actual CVR, actual new/returning split.
- If Phase 1 identified [UNCONFIRMED] items, carry those forward in the relevant report section with the same flag.
- Sections 2, 3, 4, 8, 10 are new analysis not covered by Phase 1 — generate these fresh from audit results and brain files.
- For composite clients: every section must treat each revenue line separately. Never blend.

---

# ${CLIENT_NAME} — CRO OS Onboarding Report

## 1. Client summary

[Build directly on Phase 1 research.md section 1 (business model) and section 2 (revenue lines). Do not re-derive. Write 2–3 paragraphs:
- What the client does and how they make money (from research.md)
- Revenue lines identified and their funnel types (from research.md section 2 table)
- Vertical classification and why (composite or single, with reason)
- Any critical structural observations from Phase 1 (subdomains, JS-rendering, GA4 risk flags)
Reference Phase 1 explicitly.]

---

## 2. Tag audit summary

[Fresh analysis from the audit CSV. Phase 1 does not cover this.
- Overall status: X passed, Y warnings, Z failures
- CRITICAL failures (must fix before any test runs) — list each with the specific event, the failure type, and the exact fix required
- Warnings to monitor
- Events confirmed working correctly
- Action items table: | Event | Issue | Fix | Owner | Priority |
If audit was not run, state this clearly and list what must be audited manually.]

---

## 3. Data confidence assessment

[Fresh analysis combining Phase 1 tech findings with audit results.
- Overall confidence rating: High / Medium / Low — and why
- Which funnel metrics can be trusted for analysis
- Which metrics need a caveat (and what the caveat is)
- Known data gaps from Phase 1 (subdomain split, JS rendering, cross-domain tracking) combined with audit failures
- For composite clients: confidence rating per revenue line funnel]

---

## 4. GA4 funnel setup instructions

[Fresh analysis from funnel-kpis.md framework, applied to this client's specific funnel map from Phase 1.
For each revenue line (or the single funnel if not composite):
- The exact GA4 events to use as each funnel step — reference research.md section 4 funnel map
- The three required segmentation runs (device / source-medium / new vs returning)
- The intent scoring segments most relevant to this client given their traffic mix
- Any setup blockers (missing events flagged in audit, unconfirmed steps from Phase 1)]

---

## 5. Priority questions for week 1

[Build on Phase 1 research.md section 7 (first-order CRO questions). Do not repeat generic questions.
Take the most important 5 questions from Phase 1 section 7, then add any new ones surfaced by the tag audit. Each question should:
- Reference a specific observation from Phase 1 or the audit
- State what the funnel analysis should show to answer it
- Note what is at risk if it is not answered before the first test
For composite clients: at least one question per revenue line.]

---

## 6. Recommended first hypotheses (pre-data)

[Build on Phase 1 research.md section 8 (pre-data hypotheses). Take Phase 1's 3 hypotheses as the starting point.
For each hypothesis from Phase 1:
- Validate it against the vertical knowledge base — does the KB support it?
- Add MDE estimate and test size classification
- Add what the funnel analysis must confirm before prioritising it

Then add 1–2 additional hypotheses surfaced by the tag audit or design token findings (e.g. if a key event is missing, the hypothesis about that stage becomes higher priority).

Format each as:
- Source: Phase 1 research / Tag audit / Vertical KB
- Stage: [funnel stage]
- Hypothesis: If we [change], then [metric] will [direction] because [reason]
- Evidence from Phase 1: [what was observed on the site]
- KB support: [relevant pattern from vertical knowledge base]
- Primary KPI: [metric]
- Estimated MDE: [%] | Test size: BIG / MEDIUM / SMALL
- Confirm priority when funnel shows: [what to look for]]

---

## 7. Personalisation opportunities

[Build on Phase 1 research.md. Phase 1 identified the revenue lines and buyer intent structure.
Apply the intent scoring model from personalisation-strategy.md to this specific client:
- Which 2 intent tiers are most divergent for this client given their revenue lines and traffic sources?
- What personalised experience should each tier receive? (Reference the 5-tier experience design framework)
- For composite clients: which revenue line has the clearest personalisation opportunity and why?
- What VWO conditions would implement each opportunity?
Flag anything that requires the GA4 funnel data before it can be validated.]

---

## 8. MDE baseline

[Fresh calculation — Phase 1 does not cover this.
For each revenue line (or single funnel):
- Estimated weekly sessions: [state estimate with reasoning — use vertical benchmarks from funnel-kpis.md if no real data]
- Estimated baseline CVR: [state estimate with reasoning — use vertical benchmarks by intent tier]
- MDE achievable at 6 weeks, 80% power, 95% significance
- MDE achievable at 12 weeks (Rule 5 extended window)
- Maximum viable concurrent tests before MDE exceeds 15% relative
- Segment viability: which segments from the intent scoring model are likely viable vs require aggregation (apply Part 2E of funnel-analysis.md)
Note: these are pre-data estimates. Update in scoring.md once real GA4 traffic data is available.]

---

## 9. Immediate actions — priority order

[Build on Phase 1 research.md section 10 (week 1 priority actions). Start from Phase 1's list, then add:
- Tag fixes from section 2 (ordered by severity — CRITICAL first)
- GA4 funnel setup tasks from section 4
- Any [UNCONFIRMED] items from Phase 1 that must be resolved before analysis
- Access needed (GA4, VWO, client CMS)
- Design token gaps to fill (Phase 3 limitations flagged for JS-rendered sites)

Format as a numbered list with owner (dev / analyst / client) and blocking dependency noted.]

---

## 10. 30-day onboarding plan

[A week-by-week plan that integrates the phase 1 findings, audit fixes, and first test timeline.
Week 1: [Specific tasks — tag fixes + GA4 setup + funnel analysis run — reference specific items from sections 4 and 9]
Week 2: [Specific tasks — funnel analysis review + segment index + hypothesis prioritisation — reference section 6]
Week 3: [Specific tasks — mockup build + QA + VWO setup — reference highest-priority hypothesis from section 6]
Week 4: [First test live — specify which hypothesis, which page, which segments]

For composite clients: the 30-day plan must account for the complexity of multiple funnels. Sequence the revenue lines by data confidence and traffic volume — don't try to run analysis on all funnels in week 1.]

---

Output ONLY the markdown report. Start directly with the H1 heading. No preamble.`;

// ── Call Claude API ───────────────────────────────────────────────────────────

async function callClaude(prompt) {
  const https = require('https');
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }]
    });
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: 120000
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error.message));
          const text = (parsed.content || [])
            .filter(b => b.type === 'text')
            .map(b => b.text)
            .join('');
          resolve(text);
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Claude API timeout')); });
    req.write(body);
    req.end();
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function generateReport() {
  console.log('Calling Claude API...');
  console.log(`Prompt length: ~${Math.round(prompt.length / 4)} tokens (estimated)\n`);

  let report;
  try {
    report = await callClaude(prompt);
    console.log(`Report received: ${report.length} chars`);
  } catch(e) {
    console.error('Claude API error:', e.message);
    process.exit(1);
  }

  // Write report
  const reportPath = `${dir}/onboarding-report.md`;
  fs.writeFileSync(reportPath, report);
  console.log(`\nOnboarding report written to ${reportPath}`);

  // Write status file
  const hasFailures = auditCsv.toLowerCase().includes('fail');
  const hasWarnings = auditCsv.toLowerCase().includes('warn');
  const status = {
    client: CLIENT,
    client_name: CLIENT_NAME,
    verticals,
    is_composite: isComposite,
    url: URL || meta.url,
    onboarded: date,
    phase1_complete: phase1Complete,
    tech_stack: meta.tech_stack || [],
    subdomains: meta.subdomains || [],
    audit_status: hasFailures ? 'has_failures' : hasWarnings ? 'has_warnings' : 'clean',
    design_tokens: designTokens.includes('not yet') ? 'incomplete' : 'extracted',
    report_generated: date
  };
  fs.writeFileSync(`${dir}/onboarding-status.json`, JSON.stringify(status, null, 2));
  console.log('Status file written');

  // Summary to console
  console.log('\n════════════════════════════════════════');
  console.log('  PHASE 5 COMPLETE');
  console.log('════════════════════════════════════════');
  console.log(`  Phase 1 research used:  ${phase1Complete ? 'YES' : 'NO — derived from scratch'}`);
  console.log(`  Vertical(s):            ${verticals.join(' + ') || 'unknown'}`);
  console.log(`  Composite client:       ${isComposite ? 'YES' : 'NO'}`);
  console.log(`  Audit status:           ${status.audit_status}`);
  console.log(`  Design tokens:          ${status.design_tokens}`);
  console.log(`  Report path:            ${reportPath}`);
  console.log('════════════════════════════════════════\n');
}

generateReport().catch(e => { console.error(e); process.exit(1); });
