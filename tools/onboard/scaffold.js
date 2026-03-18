/**
 * CRO OS — Phase 2: Client Scaffolder
 *
 * Creates the client folder structure and config files.
 * Reads from research.md (Phase 1 output) to pre-populate
 * context.md and config.json with real findings rather than blank templates.
 */

const fs   = require('fs');
const path = require('path');

const CLIENT      = process.env.CLIENT;
const CLIENT_NAME = process.env.CLIENT_NAME;
const URL         = process.env.URL;
const date        = new Date().toISOString().split('T')[0];

if (!CLIENT || !URL) {
  console.error('Missing required env: CLIENT, URL');
  process.exit(1);
}

const dir = `clients/${CLIENT}`;
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// Read Phase 1 outputs if available
let researchMd = '';
let meta = {};
try {
  researchMd = fs.readFileSync(`${dir}/research.md`, 'utf8');
  meta = JSON.parse(fs.readFileSync(`${dir}/research-meta.json`, 'utf8'));
  console.log('Phase 1 research loaded — pre-populating from findings');
} catch(e) {
  console.log('No Phase 1 research found — using blank templates');
}

const techStack  = meta.tech_stack || [];
const subdomains = meta.subdomains || [];

// Resolve vertical from Phase 1 — never write 'pending_phase1' if Phase 1 succeeded
const resolvedVertical = (() => {
  if (meta.verticals && Array.isArray(meta.verticals) && meta.verticals.length > 0) {
    return meta.verticals.length > 1 ? 'composite' : meta.verticals[0];
  }
  if (meta.vertical && meta.vertical !== 'pending_phase1' && meta.vertical !== 'auto') {
    return meta.vertical;
  }
  return 'pending_phase1';
})();
const resolvedVerticals = meta.verticals || (resolvedVertical !== 'pending_phase1' && resolvedVertical !== 'composite' ? [resolvedVertical] : []);

// ── config.json ───────────────────────────────────────────────────────────────
const configPath = `${dir}/config.json`;
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify({
    client_slug: CLIENT,
    client_name: CLIENT_NAME,
    url: URL,
    extractUrl: URL,
    scheduled_audit_url: URL,
    vertical: resolvedVertical,
    verticals: resolvedVerticals,
    tech_stack: techStack,
    subdomains,
    vwoImplemented: null,
    ga4Implemented: techStack.some(t => t.toLowerCase().includes('ga4')),
    gtmImplemented: techStack.some(t => t.toLowerCase().includes('gtm')),
    onboarded: date,
    phase1_complete: meta.phase1_complete || false,
    qa_selectors: {}
  }, null, 2));
  console.log('Created config.json');
}

// ── context.md — pre-populated from research.md if available ─────────────────
const contextPath = `${dir}/context.md`;
if (!fs.existsSync(contextPath)) {
  const contextContent = researchMd
    ? `# ${CLIENT_NAME} — Client Context

**Auto-populated from Phase 1 research on ${date}.**
**Review and complete sections marked [UNCONFIRMED] or [REQUIRES CLIENT INPUT].**

---

${researchMd}

---

## Manual additions required

- [ ] Confirm VWO implementation status
- [ ] Confirm GA4 property structure (single / multiple / cross-domain)
- [ ] Add CSS design tokens (from Phase 3 token extraction)
- [ ] Confirm seasonal blackouts with client
- [ ] Confirm off-limits elements with client
`
    : `# ${CLIENT_NAME} — Client Context

**Vertical:** pending
**Primary URL:** ${URL}
**Onboarded:** ${date}

## Tech stack
<!-- Confirm from page source -->

## Business model
<!-- How does the client make money? What is the primary conversion event? -->

## Key pages
<!-- List the main pages in the conversion funnel with URLs -->

## Known friction points
<!-- What do you already know about where users drop off? -->
`;

  fs.writeFileSync(contextPath, contextContent);
  console.log(`Created context.md ${researchMd ? '(pre-populated from Phase 1)' : '(blank template)'}`);
}

// ── off-limits.md ─────────────────────────────────────────────────────────────
const offLimitsPath = `${dir}/off-limits.md`;
if (!fs.existsSync(offLimitsPath)) {
  fs.writeFileSync(offLimitsPath, `# ${CLIENT_NAME} — Off-Limits Rules

**Review section 9 of research.md for signals identified in Phase 1.**
Nothing can be tested or changed in the following areas without explicit client approval:

## From Phase 1 research
<!-- Copy any off-limits signals from research.md section 9 here after review -->

## Pricing
## Legal / regulatory copy
## Brand partner logos / agreements
## Other constraints
`);
  console.log('Created off-limits.md');
}

// ── scoring.md ────────────────────────────────────────────────────────────────
const scoringPath = `${dir}/scoring.md`;
if (!fs.existsSync(scoringPath)) {
  const hasBFSI = researchMd.toLowerCase().includes('financial') || researchMd.toLowerCase().includes('insurance') || researchMd.toLowerCase().includes('mortgage');
  fs.writeFileSync(scoringPath, `# ${CLIENT_NAME} — Scoring Config

## MDE targets
mde_target_relative_default: 15%
mde_target_primary_kpi: 10%
mde_target_micro_conversion: 20%

## Traffic minimum
min_sessions_per_week: 500

## Statistical parameters
significance: 95%
power: 80%

## Seasonal blackouts
# blackouts: []  — populate after client conversation

## Vertical
# Determined from Phase 1 research — confirm and set before first test
vertical: pending
${hasBFSI ? '\n## BFSI regulatory modifier\nregulatory_complexity_modifier: true' : ''}

## Intent benchmark recalibrations
# Populate after 90 days of client-specific data
# tier_X_segment:
#   universal_expected_cvr: X%
#   client_observed_cvr: X%
#   recalibrated_expected: X%
#   reason: ...
#   date_validated: YYYY-MM-DD
`);
  console.log('Created scoring.md');
}

console.log(`\nPhase 2 scaffold complete for ${CLIENT_NAME} (${CLIENT})`);
