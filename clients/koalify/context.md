# Client Context File — Koalify

**Client:** Koalify
**Website:** koalify.com.au
**Country:** Australia
**Last updated:** March 2026
**Vertical:** Financial Services / Mortgage Broking

## 1. Business Context

Koalify is an online mortgage broker connecting Australian home buyers and refinancers with 30+ lenders and 2,000+ home loan options. Service is free to users.

### Primary Conversion Goals

| Goal | Page | Metric |
|---|---|---|
| Refinance lead | /home-loan/refinance | Form completed |
| Purchase lead | /home-loan/purchase | Form completed |
| Calculator engagement | /calculators/* | Calculator used then lead captured |

### Key Business Facts

- Free service — no fee to customer — strong trust and objection removal signal
- 30+ lenders, 2,000+ home loan options — comparison breadth signal
- Two primary journeys: refinance and purchase
- Calculator tools: refinance savings, mortgage repayment, borrowing power, bridging loan
- City-specific broker pages: Sydney, Melbourne, Brisbane, Perth

## 2. Tech Stack

| Layer | Technology | Confidence |
|---|---|---|
| Framework | Next.js React | High |
| CMS | Storyblok headless | High |
| Hosting | Likely Vercel | Medium |
| Analytics | Google Analytics 4 | Confirmed |
| A/B Testing | VWO | Confirmed |

## 3. Design System

NOTE: All CSS values need DevTools extraction. Same process as Powerleague context file.

## 4. Funnel Map

Homepage → I want to refinance or I want to buy a home → Multi-step form → Lead submitted

Known friction points:
- Two competing CTAs on homepage may need testing
- Calculator pages high intent but lead capture not confirmed
- City pages local SEO traffic but conversion unknown

## 5. Off-Limits

| Element | Constraint |
|---|---|
| AFCA membership and credit licence number | Must remain accurate and visible |
| Rate comparison claims | Must include comparison rate per ASIC rules |
| Pre-ticked consent boxes | Not permitted |
| Lender logos | Confirm usage rights before testing placement |

## 6. Test History

| Test ID | Page | Hypothesis | Result | Uplift | Date |
|---|---|---|---|---|---|
| KOA-001 | TBD | TBD | — | — | — |
