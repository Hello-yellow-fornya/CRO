# CRO OS — One-Man CRO Enterprise

A complete system for designing, developing, and QA-ing CRO tests for multiple clients. Powered by Claude AI.

---

## What This Is

A centralised repository that houses everything needed to run a professional CRO operation:
- Client context files (tech stack, CSS tokens, funnel maps)
- Vertical knowledge bases (CRO best practices by industry)
- Test database (every test ever run, tagged and searchable)
- Reusable variation code library (VWO-ready snippets)
- QA checklists
- HTML mockups (auto-deployed via Netlify)

---

## Folder Structure

```
/cro-os
│
├── /brain                        ← Shared intelligence, all clients
│     ├── scoring-model.md        ← How test priority is calculated
│     ├── qa-checklist.md         ← Standard QA before any test goes live
│     ├── brief-template.md       ← Mode 2 (human ideated) brief structure
│     └── /code-library           ← Reusable VWO-ready JS/CSS snippets
│
├── /knowledge-base               ← CRO best practices by vertical
│     ├── leisure-sports.md
│     └── financial-services.md
│
├── /test-database                ← Every test ever run
│     └── index.md                ← Master index, tagged + searchable
│
├── /clients                      ← One folder per client
│     ├── /powerleague
│     │     ├── context.md        ← Tech stack, CSS tokens, funnel map
│     │     ├── scoring.md        ← Their specific conversion weights
│     │     ├── off-limits.md     ← Frozen pages, brand rules, legal
│     │     └── /tests            ← Active test files
│     └── /koalify
│           ├── context.md
│           └── scoring.md
│
└── /mockups                      ← HTML mockups (Netlify serves this)
      ├── /powerleague
      └── /koalify
```

---

## Two Test Modes

**Mode 1 — AI Ideated**
Trigger: Provide a page URL (+ optional goal)
Claude: Analyses page → references knowledge base + test database + client context → generates hypothesis → builds mockup → writes VWO code → runs QA

**Mode 2 — Human Ideated**
Trigger: Free text brief or structured brief template
Claude: Fills any missing info → references same files → builds mockup → writes VWO code → runs QA

---

## Test Size Classification

| Size | Scope | Mockup needed | Typical duration |
|---|---|---|---|
| BIG | Full page / journey redesign | Yes — full page | 6-8 weeks |
| MEDIUM | Section / component redesign | Yes — component | 3-4 weeks |
| SMALL | Single element change | No | 1-2 weeks |

---

## How To Use With Claude

### Starting a new test (Mode 1)
```
"We're working on [client] today. 
Analyse [URL] and generate test ideas using the knowledge base and client context file."
```

### Starting a new test (Mode 2)
```
"We're working on [client] today.
I want to test [idea] on [page]. Use the brief template and generate a mockup."
```

### Deploying a mockup
Mockup HTML files saved to /mockups/[client]/ auto-deploy via Netlify on push.

---

## Clients

| Client | Vertical | Status |
|---|---|---|
| Powerleague | Leisure & Sports | Active |
| Koalify | Financial Services / Mortgage | Active |

---

## Netlify Deployment

Publish directory: `/mockups`
Auto-deploys on every push to main.
Client mockup URLs: `https://[your-domain].netlify.app/[client]/[test-id]/`
