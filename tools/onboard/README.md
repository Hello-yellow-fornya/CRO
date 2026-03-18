# Onboarding — 6-Phase Workflow

Run via GitHub Actions: **Actions → Onboard New Client → Run workflow**

## Inputs

| Input | Required | Notes |
|---|---|---|
| `client` | Yes | Slug — lowercase, no spaces. e.g. `chelseapiers` |
| `url` | Yes | Homepage URL. Phase 1 crawls from here. |
| `client_name` | Yes | Display name. e.g. `Chelsea Piers` |
| `vertical` | No | Set to `auto` to let Phase 1 determine. Override if you already know. |

## The 6 phases

### Phase 1 — Client research (NEW)
**Script:** `tools/onboard/research.js`
**Output:** `clients/[client]/research.md` + `research-meta.json`

The machine reads the client's website before anything else. It:
- Fetches the homepage and up to 6 key conversion-relevant pages
- Detects tech stack (CMS, analytics, A/B testing tools)
- Identifies subdomains (critical for GA4 cross-domain tracking decisions)
- Calls Claude to synthesise everything into a structured research document

research.md contains: business model, revenue lines, vertical classification, funnel map per revenue line, first-order CRO questions, 3 pre-data hypotheses, off-limits signals, week 1 priority actions.

**Important:** Phase 1 uses fetchUrl (no headless browser). Headless/JS-rendered sites will return minimal page text — this is flagged in the research as a tech finding, not a failure. The research still proceeds with what it can extract.

### Phase 2 — Scaffold
**Script:** `tools/onboard/scaffold.js`
**Output:** `clients/[client]/` folder structure

Creates config.json, context.md, off-limits.md, scoring.md. If Phase 1 completed successfully, context.md is pre-populated with research.md findings rather than blank templates.

### Phase 3 — Design token extraction
**Script:** `tools/extract-tokens.js`
**Output:** `clients/[client]/design-tokens.md`

Extracts CSS variables, typography, colours, border radius, spacing from the live site. Note: headless sites (Sanity, Next.js with CSS-in-JS) may return limited tokens — Phase 1 flags this.

### Phase 4 — Tag audit
**Script:** `tools/audit/stage3-qa.js`
**Output:** `clients/[client]/audit-stage3-[date].csv`

Automated GA4 tag health check. Checks for 7 failure patterns, VWO presence, GTM presence. Requires the conversion page URL to test against.

### Phase 5 — Onboarding report
**Script:** `tools/onboard/generate-report.js`
**Output:** `clients/[client]/onboarding-report.md`

Calls Claude with: research.md + tag audit results + design tokens + all relevant brain files. Generates a 10-section onboarding report. Phase 1 research is the new primary input — the report now starts from business understanding, not from a blank brief.

### Phase 6 — Commit
Commits all outputs to the repo and uploads as GitHub Actions artifacts.

## What research.md contains

1. Business model summary
2. Revenue lines table (each line = a separate funnel)
3. Vertical classification (single or composite)
4. Funnel map per revenue line
5. Tech stack with CRO implications
6. Domain/subdomain structure with GA4 risk flags
7. First-order CRO questions (site-specific, not generic)
8. Three pre-data hypotheses
9. Off-limits signals from the site
10. Week 1 priority actions

## After onboarding

- Review research.md — correct anything the machine got wrong
- Complete sections marked [UNCONFIRMED]
- Move off-limits findings from research.md section 9 into off-limits.md
- Set vertical in config.json (if Phase 1 classified as composite, set verticals array)
- Run GA4 funnel setup per the funnel maps in research.md
- Begin Week 1 priority actions
