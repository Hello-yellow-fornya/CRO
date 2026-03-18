# Funnel KPIs — Per-Vertical Definitions
**Purpose:** Define the correct primary and secondary KPIs for each vertical. Every funnel analysis, test design, and report must use the KPIs defined here — not generic "conversion rate".
---
## Leisure / Activity Booking
**Primary KPI:** `purchase` (booking completed)
**Secondary KPIs:** `begin_checkout`, `select_item` (package selection), `view_item`
**Funnel stages:**
1. Landing → view_item (package page viewed)
2. view_item → select_item (package selected)
3. select_item → begin_checkout (date/location chosen, checkout started)
4. begin_checkout → purchase (payment completed)
**Known drop-off patterns:**
- Stage 3→4 cliff: users select a package but never reach checkout — often a location/date selection UX problem
- Mobile abandonment at checkout: form length and payment friction
---
## Ecommerce
**Primary KPI:** `purchase` (transaction completed)
**Secondary KPIs:** `add_to_cart`, `begin_checkout`, `view_item`
**Funnel stages:**
1. Landing → view_item_list (category browsed)
2. view_item_list → view_item (product page viewed)
3. view_item → add_to_cart
4. add_to_cart → begin_checkout
5. begin_checkout → purchase
**Known drop-off patterns:**
- Cart abandonment (stage 4→5): shipping costs revealed, account creation required
- Category to product (stage 2→3): poor product filtering, overwhelming choice
---
## Lead Generation
**Primary KPI:** `generate_lead` (form submitted)
**Secondary KPIs:** `form_start`, `cta_click`, `calculator_use`
**Funnel stages:**
1. Landing → cta_click (primary CTA engaged)
2. cta_click → form_start (form opened)
3. form_start → form_step_complete (multi-step progress)
4. form_step_complete → generate_lead (form submitted)
**Known drop-off patterns:**
- CTA to form (stage 2→3): unclear value proposition, form feels too long
- Multi-step abandonment: too many steps, unclear progress, asking for sensitive info too early
---
## Financial Services
**Primary KPI:** `generate_lead` (application submitted)
**Secondary KPIs:** `calculator_use`, `form_start`, `form_step_complete`
**Funnel stages:**
1. Landing → calculator_use or cta_click
2. Calculator/CTA → form_start (application started)
3. form_start → form_step_complete (steps progressed)
4. form_step_complete → generate_lead (application submitted)
**Known drop-off patterns:**
- Calculator to application (stage 2→3): result doesn't clearly lead to next action
- Multi-step forms: regulatory fields feel invasive, unclear why information is needed
---
## SaaS
**Primary KPI:** `sign_up` (trial or demo started)
**Secondary KPIs:** `cta_click`, `pricing_view`, `demo_request`
**Funnel stages:**
1. Landing → pricing_view or feature exploration
2. Pricing/features → cta_click (trial or demo CTA)
3. cta_click → sign_up (account created or demo booked)
**Known drop-off patterns:**
- Pricing page bounce: unclear pricing tiers, no free option visible
- Sign-up form: requiring credit card for trial, too many fields
---
## Travel
**Primary KPI:** `purchase` (booking completed)
**Secondary KPIs:** `search`, `view_item`, `begin_checkout`
**Funnel stages:**
1. Landing → search (dates/destination selected)
2. search → view_item_list (results viewed)
3. view_item_list → view_item (specific option viewed)
4. view_item → begin_checkout (booking started)
5. begin_checkout → purchase (payment completed)
**Known drop-off patterns:**
- Search to results (stage 2→3): no availability, confusing date picker
- Results to selection (stage 3→4): overwhelming options, unclear pricing
---
## Composite Verticals — Hybrid Funnel Clients
Some clients have two distinct conversion paths running simultaneously from the same traffic pool. The most common pattern is a transactional funnel (direct booking or purchase) running alongside a lead funnel (enquiry form, callback request, quote). Powerleague is an example: users can book directly or submit an enquiry.
### Why this requires separate treatment
A blended CVR across both funnels is meaningless. A user who submits an enquiry has not failed to convert — they have converted on the lead funnel. Reporting them as a bounce or non-conversion against the booking funnel misrepresents both funnels.
### Rules for composite funnel analysis
**Rule 1 — Two separate funnel explorations in GA4**
Build one funnel for the transactional path and a completely separate funnel for the lead path. Never merge them.
**Rule 2 — Two separate primary KPIs**
| Funnel | Primary KPI | Do not use |
|---|---|---|
| Transactional | `purchase` event | Blended CVR |
| Lead | `generate_lead` event | Blended CVR |
**Rule 3 — Shared traffic, separate analysis**
Both funnels draw from the same weekly session pool. When calculating MDE:
- If the test only affects one funnel: use that funnel's session volume and CVR
- If the test affects shared pages (e.g. homepage): split the traffic estimate between funnels based on observed funnel entry rates
- Never use total site sessions as the denominator for a single-funnel test
**Rule 4 — Audience overlap is an asset, not a problem**
A user who entered the lead funnel but is now returning via email is a high-intent signal. Track funnel switching behaviour — users who first enquire then later book directly are your highest-value returning segment.
**Rule 5 — Personalisation by funnel intent**
The intent scoring model applies per funnel:
- A new user from Meta who lands on the enquiry page is Tier 1 on the lead funnel
- A returning user from email who lands on the booking page is Tier 5 on the transactional funnel
- The same user can be different tiers on different funnels — score by the funnel they're currently in
**Rule 6 — Report format for composite clients**
Every report section must split by funnel:
```
Metric          | Transactional funnel | Lead funnel
----------------|---------------------|-------------
Weekly sessions | 4,200               | 800
Conversions     | 67                  | 31
CVR             | 1.60%               | 3.87%
Top drop-off    | Stage 3→4           | Stage 4→5
```
Never show a single blended CVR to a composite client. It hides more than it reveals.
