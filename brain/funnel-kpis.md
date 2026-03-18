# Funnel Stages & KPI Framework by Vertical

**Purpose:** Every hypothesis, test, and mockup must be anchored to a funnel stage, a primary KPI, and at least one secondary KPI. This prevents tests that optimise vanity metrics while leaving revenue flat.

**Rule:** A test that moves secondary KPIs but not the primary KPI is not a win. A test that moves the primary KPI directly is always a win, regardless of secondary movement.

---

## The Framework

Every test must declare:

```
Funnel stage:     [which stage is being tested]
Primary KPI:      [the one metric that defines success — must be revenue or a direct revenue proxy]
Secondary KPI(s): [leading indicators that should move if the test is working]
Guardrail metric: [metric that must NOT go down — tests moving primary but damaging guardrail need review]
```

The primary KPI is always the same for a given vertical — it never changes.
The secondary KPI changes depending on which funnel stage is being tested.

---

## Vertical: Leisure & Sports (Powerleague model)

**Business model:** Activity booking — revenue generated at package selection + payment completion

**Primary KPI:** Bookings completed (revenue)

| Funnel Stage | Stage Description | Secondary KPI | Guardrail Metric |
|---|---|---|---|
| 1. Awareness / Landing | User arrives on activity/party page | Time on page, scroll depth to packages | Bounce rate |
| 2. Package Consideration | User views package details, compares options | Package detail expansion / clicks | Bounce rate |
| 3. Package Selection | User selects a specific package | Package selection rate (which package, not just that one was selected) | - |
| 4. Date & Location | User picks date, time, venue | Date selector engagement, location selection | Drop-off at this step |
| 5. Basket / Summary | User reviews order before checkout | Basket page → checkout starts | Basket abandonment rate |
| 6. Checkout | User enters payment details | Checkout step completion rates | Form error rate |
| 7. **Booking Completed** | ★ PRIMARY KPI | Revenue per visitor, bookings per session | Refund rate |

**CRO focus for Powerleague:**
- Stage 1 → 2 is the biggest drop (users don't understand what's included in packages)
- Stage 3 → 4 is the second biggest (location not surfaced early enough — users select package then find no nearby venue)
- Stage 5 → 7 is high-intent but leaks from complexity (split payment not visible early)

**Hypothesis must reference:** Which stage it targets and what the secondary KPI is.
Example: *"Moving location selector to Stage 2 (before package selection) will increase bookings completed [primary] because 68% of drop-off at Stage 3→4 is location-driven [secondary: location selector engagement]"*

---

## Vertical: Financial Services / Mortgage (Koalify model)

**Business model:** Lead generation — revenue generated when broker completes a deal from a submitted application

**Primary KPI:** Qualified lead submissions (completed applications)

*Note: Not all lead submissions are equal. Koalify's primary KPI is QUALIFIED submissions — applications with sufficient detail for a broker to act on. A high volume of incomplete or low-quality submissions is not a win.*

| Funnel Stage | Stage Description | Secondary KPI | Guardrail Metric |
|---|---|---|---|
| 1. Awareness / Intent | User arrives via search, ad, or referral | Scroll depth, time on page | Bounce rate |
| 2. Intent Validation | User engages with calculator, reads content | Calculator completions, page depth | Exit rate on calculator |
| 3. Journey Selection | User chooses refinance vs purchase path | CTA click (correct journey path) | Wrong journey selection rate |
| 4. Form Start | User begins application | Form start rate (% of page visitors) | - |
| 5. Form Progression | User completes each step | Step completion rates, time per step | Step abandonment rate |
| 6. Form Friction | User encounters complex questions | Re-entry rate on hard fields | Field error rate |
| 7. **Application Submitted** | ★ PRIMARY KPI | Qualified submission rate | Drop-off in broker follow-up |

**BFSI-specific note:** Controlled friction is intentional here (see financial-services.md). Moving a phone number field to Step 1 reduced volume but increased qualified submissions by 44.25% (ICICI Lombard case). More leads ≠ better outcome. Primary KPI must measure quality not just volume.

**Dual North Star approach for Koalify:**
- Business KPI: Applications submitted → deals completed → revenue
- Experience KPI: Time to complete application, step abandonment rate, form error rate

Both matter. A 20% lift in submissions that doubles average completion time is not a clean win.

---

## Vertical: Ecommerce

**Business model:** Direct product sales

**Primary KPI:** Revenue per visitor (not conversion rate — accounts for AOV changes that conversion rate misses)

*Why revenue per visitor not conversion rate: A test that increases conversion rate by 5% but decreases AOV by 20% is a negative outcome. Revenue per visitor captures both.*

| Funnel Stage | Stage Description | Secondary KPI | Guardrail Metric |
|---|---|---|---|
| 1. Discovery | User arrives on category or homepage | Category click-through rate | Bounce rate |
| 2. Category / Search | User browses or filters products | Product click-through rate, filter usage | Zero-result search rate |
| 3. Product Detail Page (PDP) | User views individual product | Add-to-cart rate, image engagement, review reads | - |
| 4. Cart | User reviews basket | Cart → checkout start rate | Cart abandonment rate |
| 5. Checkout | User enters delivery + payment | Checkout step completion rates | Payment error rate |
| 6. **Purchase Completed** | ★ PRIMARY KPI | Revenue per visitor, AOV, repeat purchase rate | Refund rate, return rate |

**Key distinction — PDP as secondary KPI:**
PDP views are a secondary KPI for Stage 2 tests (does the category page drive users to product pages?).
Add-to-cart rate is a secondary KPI for Stage 3 tests (does the PDP convince users to buy?).
PDP views are NOT a secondary KPI for Stage 3 tests — if you're testing on the PDP, the secondary KPI is what happens after viewing, not the view itself.

**Common ecommerce CRO traps:**
- Optimising for add-to-cart without tracking purchase completion (high cart abandonment means add-to-cart is a misleading metric)
- Optimising for conversion rate without tracking AOV (discounts inflate CR but destroy revenue)
- Treating homepage bounce rate as a primary metric (it's a symptom, not the problem)

---

## Vertical: SaaS

**Business model:** Recurring subscription revenue

**Primary KPI:** Paid conversion (free trial → paid plan) or MRR from new signups

*Note: For acquisition-focused CRO, the primary KPI is trial signups. For activation-focused CRO, it's trial → paid conversion. Declare which phase the test belongs to.*

| Funnel Stage | Stage Description | Secondary KPI | Guardrail Metric |
|---|---|---|---|
| 1. Landing | User arrives on homepage or landing page | Scroll to pricing, time on features section | Bounce rate |
| 2. Intent Signals | User engages with social proof, features, pricing | Pricing page views, testimonial engagement | - |
| 3. Trial/Demo CTA | User clicks primary CTA | CTA click rate by placement | - |
| 4. **Trial Signup** | ★ PRIMARY KPI (acquisition phase) | Signup completion rate, form abandonment | Signup quality (email domain) |
| 5. Onboarding | New user completes setup steps | Onboarding step completion, time to first value | 7-day retention |
| 6. Activation | User completes the core value action | Feature adoption rate, return visit rate | - |
| 7. **Paid Conversion** | ★ PRIMARY KPI (activation phase) | Upgrade page views, plan selection | Churn rate at 30 days |

**SaaS-specific note:** Free-to-paid conversion rate is heavily influenced by activation quality. A test that increases trial signups but decreases the quality of those signups (lower activation, lower paid conversion) is not a win. Track the full funnel cohort, not just the top.

---

## Vertical: Lead Generation (B2B)

**Business model:** Qualified leads passed to sales team

**Primary KPI:** Qualified lead submissions (form completions with sufficient data for sales follow-up)

| Funnel Stage | Stage Description | Secondary KPI | Guardrail Metric |
|---|---|---|---|
| 1. Landing | User arrives from ad, search, or referral | Scroll depth, time on page | Bounce rate |
| 2. Content Engagement | User reads content, watches video, downloads asset | Content engagement rate, asset download rate | - |
| 3. Intent Signal | User visits pricing, case study, or contact page | Pricing page views, demo request clicks | - |
| 4. Form Discovery | User reaches and views the form | Form visibility rate (scroll to form) | - |
| 5. Form Start | User begins filling the form | Form start rate | - |
| 6. **Form Completion** | ★ PRIMARY KPI | Qualified lead rate, sales-accepted lead rate | Form error rate, incomplete submissions |

**Lead gen CRO note:** The Zeigarnik Effect is powerful here — hiding the form behind a micro-commitment (e.g. "Get your free audit" button) before revealing the form increases both start rate and completion rate. The commitment creates a psychological obligation to finish.

---

## Vertical: Travel

**Business model:** Booking commissions or direct booking revenue

**Primary KPI:** Bookings completed (or booking value)

| Funnel Stage | Stage Description | Secondary KPI | Guardrail Metric |
|---|---|---|---|
| 1. Inspiration | User browses destinations, dates | Destination click-through, search initiation | Bounce rate |
| 2. Search & Filter | User searches with specific parameters | Search refinement rate, filter usage | Zero-result searches |
| 3. Results Consideration | User browses results, views options | Results click-through rate, comparison actions | - |
| 4. Option Detail | User views specific hotel/flight/package | Detail page engagement, image views, review reads | - |
| 5. Selection & Intent | User selects option, views price breakdown | Add to basket / select rate | Price display abandonment |
| 6. Checkout | User enters traveller + payment details | Checkout step completion | Payment error rate |
| 7. **Booking Completed** | ★ PRIMARY KPI | Revenue per visitor, booking value, repeat booking rate | Cancellation rate |

---

## How to Apply This Framework in Hypothesis Writing

Every hypothesis in `test-database/index.md` must include:

```yaml
funnel_stage: [stage number and name]
primary_kpi: [the primary KPI for this vertical]
secondary_kpi: [the leading indicator for this specific stage]
guardrail_metric: [what must not go down]
```

**Example — Powerleague package page:**
```yaml
funnel_stage: 2 — Package Consideration
primary_kpi: Bookings completed
secondary_kpi: Package selection rate (% of visitors who select a package)
guardrail_metric: Bounce rate from package page
```

**Example — Koalify calculator:**
```yaml
funnel_stage: 2 — Intent Validation
primary_kpi: Qualified application submissions
secondary_kpi: Calculator completion rate
guardrail_metric: Step abandonment rate (quality signal — completions that stop at Step 1 are low quality)
```

---

## KPI Hierarchy — What Each Level Tells You

```
PRIMARY KPI (revenue / qualified conversion)
│
│  "Did the test actually make money?"
│
├── SECONDARY KPI (stage-specific leading indicator)
│   │
│   │  "Is the test moving users through this stage?"
│   │
│   └── GUARDRAIL METRIC (must not regress)
│        │
│        │  "Is the test creating unintended negative effects?"
│        │
│        └── DIAGNOSTIC METRICS (explain the result)
│              "Why did the primary KPI move or not move?"
│              (e.g. device breakdown, new vs returning, traffic source)
```

**When primary KPI moves and secondary KPI moves:** Clean win. The mechanism is understood.

**When primary KPI moves but secondary KPI doesn't:** Interesting — users are converting via a different path than expected. Dig into diagnostic metrics.

**When secondary KPI moves but primary KPI doesn't:** Concerning. The test is generating activity but not value. Do not deploy. Investigate why the funnel stage improvement isn't converting downstream.

**When guardrail metric regresses significantly:** Hold deployment regardless of primary KPI movement. A test that lifts bookings but triples refund rate is not a win.

---

## Minimum Traffic Requirements by KPI Type

| Primary KPI | Minimum weekly volume needed to test | Why |
|---|---|---|
| Direct revenue / bookings | 50 conversions/week per variant | Revenue events are rare — need volume to reach significance |
| Lead form submissions | 30 submissions/week per variant | Lower frequency than ecommerce |
| Trial signups | 100 signups/week per variant | Higher frequency allows faster tests |
| Secondary KPI only (e.g. PDP views) | 500 events/week per variant | Micro-events need less traffic but test only informs stage, not revenue |

**If primary KPI volume is too low:** Test for secondary KPI only AND run for longer. Flag in test brief: "Primary KPI may not reach significance — secondary KPI is the primary success indicator for this test."

This is especially relevant for Powerleague (lower booking volume) and Koalify (lower lead volume) compared to high-traffic ecommerce sites.


## Funnel Stage Benchmarks by Intent Tier

These are the expected pass rates for each stage transition, used as the denominator in the intent-adjusted index. Two things to understand before using them:

**Intent sensitivity varies by stage.** Some stages are highly sensitive to intent — cold traffic and high-intent traffic behave very differently. Other stages are low sensitivity — once a user reaches that point, intent is demonstrated and the pass rate range narrows. The driver of underperformance at low-sensitivity stages is almost always UX or friction, not audience quality.

**Weighting reflects funnel position.** The final conversion stage always carries the highest weight (1.5×). The highest drop-off stage for a given client gets 1.2×. Other stages are 1.0×.
