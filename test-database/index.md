# Test Database

## Overview
Central register of all CRO tests across clients. Use this index to track status, results, and learnings.

## Test Log Format

| Field              | Description                                    |
|--------------------|------------------------------------------------|
| **Test ID**        | Unique identifier (e.g., PL-001, KO-001)      |
| **Client**         | Client name                                    |
| **Test Name**      | Descriptive name                               |
| **Page / URL**     | Where the test ran                             |
| **Hypothesis**     | If [change], then [outcome], because [reason]  |
| **Status**         | Planned / Live / Complete / Killed             |
| **Start Date**     | Launch date                                    |
| **End Date**       | Completion date                                |
| **Primary KPI**    | What was measured                              |
| **Result**         | Win / Loss / Inconclusive                      |
| **Uplift**         | % change with confidence interval              |
| **Confidence**     | Statistical significance level                 |
| **Learnings**      | Key takeaway from the test                     |
| **Link to Brief**  | Link to full test brief                        |

## Directory Structure
Organise completed test reports by client:

```
test-database/
├── index.md
├── powerleague/
│   ├── PL-001-hero-cta.md
│   └── PL-002-booking-flow.md
└── koalify/
    ├── KO-001-pricing-page.md
    └── KO-002-signup-form.md
```

## Naming Convention
`[CLIENT_CODE]-[###]-[short-description].md`

## Tagging Tests
Tag each test with relevant categories for future reference:
- **Type**: Copy, Layout, UX, Social Proof, Pricing, Form, Navigation
- **Funnel Stage**: Awareness, Consideration, Conversion, Retention
- **Device**: Desktop, Mobile, Both
- **Result**: Win, Loss, Inconclusive
