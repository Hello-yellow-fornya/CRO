/**
 * CRO OS — Onboarding Report Generator
 * Produces a comprehensive onboarding report for a new client.
 * Supports single verticals and composite (multi-funnel) verticals.
 */
const fs = require('fs');
const path = require('path');
const client = process.env.CLIENT;
const clientName = process.env.CLIENT_NAME || client;
const url = process.env.URL;
const vertical = process.env.VERTICAL || 'ecommerce';
const date = new Date().toISOString().split('T')[0];
if (!client || !url) {
  console.error('Missing required env: CLIENT, URL');
  process.exit(1);
}
// Load client config if it exists
let config = {};
try {
  config = JSON.parse(fs.readFileSync(`clients/${client}/config.json`, 'utf8'));
} catch (e) {
  console.log('No client config found — using defaults');
}
// Load context file if it exists
let context = '';
try {
  context = fs.readFileSync(`clients/${client}/context.md`, 'utf8');
} catch (e) {
  console.log('No context.md found');
}
const isComposite = vertical === 'composite';
const verticalsNote = isComposite
  ? `This is a COMPOSITE client with two parallel funnels: ${(process.env.VERTICALS || '').split(',').join(' and ')}. Every section of the report must address BOTH funnels separately where relevant — do not merge them into one.`
  : '';
// ── Build the report prompt ──────────────────────────────────────────────────
const prompt = `
You are a CRO analyst producing an onboarding report for a new client.

CLIENT: ${clientName}
URL: ${url}
VERTICAL: ${vertical}
${verticalsNote}
DATE: ${date}

CLIENT CONTEXT:
${context}

Produce a complete onboarding report in markdown format covering ALL of the following sections.

## 1. Client overview
- Business model summary
- Primary conversion action(s)
- Key pages and entry points
- Tech stack (CMS, analytics, A/B testing tools)

## 2. Funnel analysis
- Map the full conversion funnel from landing to conversion
- Identify each stage and the transition between stages
- Note where drop-off is most likely based on the page structure
- Flag any stages that are missing tracking

## 3. Data confidence assessment
- Is GA4 installed and firing correctly?
- Is GTM present? What tags are active?
- Are ecommerce events properly structured?
- What is the estimated weekly session volume?
- Can we reach statistical significance for A/B tests within 2–4 weeks?

## 3b. Composite funnel map (ONLY if composite vertical)
If this is a composite client, map out how the two funnels relate:
- Do users enter both funnels from the same pages, or different entry points?
- Is the lead funnel a fallback for users who aren't ready to transact?
- Are returning users more likely to use the transactional funnel?
- How should the MDE calculator treat shared traffic — are the two funnels competing for the same sessions or additive?
- What does a "blended" CVR hide in this context — and why should it never be reported as a single number?

## 4. Quick wins
- Identify 3–5 high-confidence, low-effort improvements
- Each must reference a specific page element or user flow
- Score each on potential × importance × ease (1–5 scale)

## 5. Test roadmap
- Propose 3–5 A/B tests for the first 90 days
- Each test must have: hypothesis, primary metric, estimated MDE, and test duration
- Order by expected impact

## 6. Risks and blockers
- Technical blockers (missing tracking, slow pages, broken flows)
- Business constraints (regulatory, brand guidelines, seasonal factors)
- Data limitations (low traffic, unreliable tracking)

## 7. Recommendations
- Immediate actions (week 1)
- Short-term priorities (weeks 2–4)
- Medium-term roadmap (months 2–3)
`;
// ── Output ───────────────────────────────────────────────────────────────────
const outDir = `clients/${client}`;
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const promptPath = `${outDir}/onboard-report-prompt-${date}.md`;
fs.writeFileSync(promptPath, prompt);
console.log(`\nCRO OS — Onboarding Report Generator`);
console.log(`Client: ${clientName} | Vertical: ${vertical}`);
if (isComposite) console.log(`Composite: ${process.env.VERTICALS}`);
console.log(`\nReport prompt written to: ${promptPath}`);
console.log(`\nNext steps:`);
console.log(`  1. Review the prompt in ${promptPath}`);
console.log(`  2. Feed it to Claude or your preferred LLM with the client's page data`);
console.log(`  3. Save the output as clients/${client}/onboard-report-${date}.md`);
