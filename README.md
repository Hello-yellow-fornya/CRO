# CRO OS — One-Man CRO Enterprise
A complete system for designing, developing and QA-ing CRO tests for multiple clients. Powered by Claude AI.
## Folder Structure
```
/CRO
├── /brain
│     ├── scoring-model.md
│     ├── qa-checklist.md
│     ├── brief-template.md
│     └── /code-library
├── /knowledge-base
│     ├── leisure-sports.md
│     └── financial-services.md
├── /test-database
│     └── index.md
├── /clients
│     ├── /powerleague
│     └── /koalify
└── /mockups
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
## Clients
| Client | Vertical | Status |
|---|---|---|
| Powerleague | Leisure & Sports | Active |
| Koalify | Financial Services | Active |
