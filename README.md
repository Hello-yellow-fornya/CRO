# CRO OS — One-Man CRO Enterprise

A complete system for designing, developing and QA-ing CRO tests for multiple clients. Powered by Claude AI.

## Folder Structure

```
/CRO
├── /brain
│     ├── scoring-model.md
│     ├── qa-checklist.md
│     ├── brief-template.md
│     ├── cro-principles.md
│     ├── design-principles.md
│     ├── anti-ai-design-layer.md
│     ├── performance.md
│     ├── funnel-kpis.md
│     ├── funnel-analysis.md
│     ├── personalisation-strategy.md
│     └── /code-library
├── /knowledge-base
│     ├── leisure-sports.md
│     ├── financial-services.md
│     ├── ecommerce.md
│     ├── lead-gen.md
│     ├── mobile-ux.md
│     ├── saas.md
│     ├── travel.md
│     └── competitor-audit.md
├── /test-database
│     └── index.md
├── /clients
│     ├── /powerleague
│     └── /koalify
├── /mockups
└── /tools
      ├── extract-tokens.js
      ├── package.json
      ├── /audit
      │     ├── stage3-qa.js
      │     └── README.md
      └── /onboard
            ├── research.js
            ├── scaffold.js
            ├── generate-report.js
            └── README.md
```

## Two Test Modes

**Mode 1 — AI Ideated:** Provide a page URL. Claude analyses it, references the knowledge base + test database + client context, then generates hypothesis → mockup → VWO code → QA.

**Mode 2 — Human Ideated:** Free text brief. Claude fills gaps, then follows the same pipeline.

## Test Size Classification

| Size | Scope | Mockup | Duration |
|---|---|---|---|
| BIG | Full page redesign | Yes | 6–8 weeks |
| MEDIUM | Section/component | Yes | 3–4 weeks |
| SMALL | Single element | No | 1–2 weeks |

## New Client Onboarding — 6 Phases

Run via **GitHub Actions → Onboard New Client → Run workflow**

| Phase | What it does | Automated? |
|---|---|---|
| 1 — Research | Machine reads the site, identifies revenue lines, vertical, funnels, tech stack | Yes |
| 2 — Scaffold | Creates client folder, pre-populated from Phase 1 | Yes |
| 3 — Design tokens | Extracts CSS colours, fonts, spacing | Yes |
| 4 — Tag audit | GA4 event health check, VWO/GTM presence | Yes |
| 5 — Report | 10-section onboarding report via Claude API | Yes |
| 6 — Human review | Fix [UNCONFIRMED] items, confirm off-limits, configure GA4 funnels | Human |

## Active Test Cycle

A → Funnel analysis (GA4) → B → Segment viability (MDE) → C → Intent-adjusted index → D → Stage drill-down → E → P.I.E. scoring → F → Hypothesis → G → Mockup → H → QA → I → Launch → J → Results + test DB

## Clients

| Client | Vertical | Status |
|---|---|---|
| Powerleague | Leisure + Lead gen (composite) | Active |
| Koalify | Financial Services | Active |
