# Full Funnel Analysis Framework

**Purpose:** Before any test runs, we must understand exactly how the funnel performs across every device, source, and campaign — and confirm that the tracking required to measure it is actually working. Bad data produces bad hypotheses. This file governs how we audit, analyse, and report on the full funnel for every client.

**Rule:** No test gets prioritised from gut feel alone. Every priority decision must be backed by funnel data. And no funnel data can be trusted until the tag audit says it can.

---

## Part 1 — Tag & Data Audit

Run this before touching GA4 data for analysis. A broken tag means the drop-off you think you're seeing may not be real — or the conversion you think you're measuring may be miscounted.

### Phase 1A — Property Setup Verification

**GA4 Property checks:**
```
[ ] GA4 Measurement ID confirmed and documented (format: G-XXXXXXXX)
[ ] GTM Container ID confirmed and documented (format: GTM-XXXXXXX)
[ ] GA4 installed via GTM (preferred) or hardcoded — document which
[ ] Single GA4 tag firing per page — no duplicates (duplicate = double-counted events)
[ ] Data stream active and receiving hits (check Realtime report)
[ ] Timezone set correctly for client's primary market
[ ] Currency set correctly (GBP for UK clients, AUD for Koalify)
[ ] Data retention set to 14 months (default is 2 months — change this immediately)
[ ] Internal IP addresses filtered (office IPs excluded from data)
[ ] Bot filtering enabled
[ ] Cross-domain tracking configured if checkout is on subdomain or third party
[ ] Referral exclusion list includes payment providers (Stripe, PayPal, etc.) to prevent self-referrals
[ ] Test/staging environment excluded from production property
```

**GTM Container checks:**
```
[ ] GTM snippet installed on ALL pages — use GTM Tag Coverage tool to verify
[ ] GTM snippet in correct position (opening <head> and opening <body>)
[ ] No unpublished changes sitting in draft that should be live
[ ] Naming convention consistent across tags, triggers, variables (e.g. GA4 - Page View, GA4 - Purchase)
[ ] No duplicate tags serving the same purpose
[ ] No paused tags that should be active
[ ] Environment tags correctly separated (staging vs production)
[ ] GTM Preview Mode tested on all critical pages before any new publish
```

### Phase 1B — Funnel Event Verification

For each funnel stage, verify the event fires correctly, fires only once, and passes correct parameters. Test in GTM Preview Mode + GA4 DebugView simultaneously.

**How to test:**
1. Open GTM Preview Mode → enter site URL
2. Open GA4 DebugView (Admin → DebugView) in a second tab
3. Walk through each funnel stage manually
4. Confirm event appears in GTM Preview (fired, not just loaded)
5. Confirm same event appears in DebugView with correct parameters
6. Document pass/fail and any parameter errors

**Universal events (all verticals):**

| Event | Trigger condition | Key parameters to verify | Common failure |
|---|---|---|---|
| `page_view` | Every page load | `page_location`, `page_title` | Fires on 404 pages, missing on SPAs |
| `session_start` | First hit of session | `session_id` | Inflated if referral exclusions missing |
| `first_visit` | New user first ever visit | — | Double-counts if cookie consent blocks GA4 |
| `scroll` | 90% scroll depth | `percent_scrolled` | Enhanced Measurement must be on |
| `click` (outbound) | Clicks leaving domain | `link_url` | Fires on all clicks not just external |

**Leisure/Sports funnel events (Powerleague model):**

| Funnel Stage | GA4 Event | Key parameters | Verify |
|---|---|---|---|
| Landing page view | `page_view` | `page_location` contains `/football-birthday-party` | ✓/✗ |
| Package viewed | `view_item` | `item_name`, `item_category`, `price` | ✓/✗ |
| Package selected | `select_item` | `item_name`, `item_id` | ✓/✗ |
| Date picker engaged | custom: `date_picker_open` | `item_id` | ✓/✗ |
| Location selected | custom: `location_selected` | `location_name` | ✓/✗ |
| Checkout started | `begin_checkout` | `value`, `currency`, `items[]` | ✓/✗ |
| Payment info entered | `add_payment_info` | `payment_type` | ✓/✗ |
| **Booking completed** | `purchase` | `transaction_id`, `value`, `currency`, `items[]` | ✓/✗ |

**Financial services funnel events (Koalify model):**

| Funnel Stage | GA4 Event | Key parameters | Verify |
|---|---|---|---|
| Landing page view | `page_view` | `page_location` | ✓/✗ |
| Calculator started | custom: `calculator_start` | `calculator_type` (refinance/purchase) | ✓/✗ |
| Calculator completed | custom: `calculator_complete` | `loan_amount`, `journey_type` | ✓/✗ |
| Journey CTA clicked | custom: `journey_selected` | `journey_type` (refinance/purchase) | ✓/✗ |
| Form started | custom: `form_start` | `form_name`, `step_number` | ✓/✗ |
| Form step completed | custom: `form_step_complete` | `step_number`, `step_name` | ✓/✗ |
| **Application submitted** | `generate_lead` | `lead_type`, `form_name`, `value` (if known) | ✓/✗ |

**Ecommerce funnel events (standard):**

| Funnel Stage | GA4 Event | Key parameters | Verify |
|---|---|---|---|
| Product list view | `view_item_list` | `item_list_name`, `items[]` | ✓/✗ |
| Product detail view | `view_item` | `item_id`, `item_name`, `price`, `item_category` | ✓/✗ |
| Add to cart | `add_to_cart` | `item_id`, `item_name`, `price`, `quantity` | ✓/✗ |
| View cart | `view_cart` | `value`, `currency`, `items[]` | ✓/✗ |
| Begin checkout | `begin_checkout` | `value`, `currency`, `items[]` | ✓/✗ |
| Shipping info | `add_shipping_info` | `shipping_tier` | ✓/✗ |
| Payment info | `add_payment_info` | `payment_type` | ✓/✗ |
| **Purchase** | `purchase` | `transaction_id`, `value`, `revenue`, `tax`, `shipping`, `currency`, `items[]` | ✓/✗ |

### Phase 1C — VWO Tag Verification

VWO introduces its own tracking layer that must work alongside GA4, not instead of it.

```
[ ] VWO SmartCode installed in <head> synchronously on all test pages
[ ] VWO async timeout set to 100ms (prevents blank page on VWO failure)
[ ] VWO-GA4 integration enabled in VWO → Configurations → Integrations
[ ] VWO campaign data flowing to GA4 (verify via GA4 DebugView — look for vwo_campaign_name parameter)
[ ] VWO custom dimensions created in GA4:
      - Dimension name: "VWO Campaign Name" / Event parameter: vwo_campaign_name
      - Dimension name: "VWO Variation Name" / Event parameter: vwo_variation_name
[ ] VWO not installed on pages where it isn't running tests (performance tax)
[ ] VWO variation assignments consistent — same user always sees same variation
[ ] VWO test traffic exclusion working — internal team not seeing variations
```

**Verifying VWO → GA4 data push:**
1. Run GTM Preview on a page where VWO test is active
2. Trigger the page as a test visitor
3. In GA4 DebugView, look for event: `VWO`
4. Parameters should include: `ep.vwo_campaign_name` and `ep.vwo_variation_name`
5. If missing: check VWO integration is enabled AND GTM container is published with VWO triggers

### Phase 1D — Attribution & UTM Audit

If source/medium data is wrong, all funnel analysis by channel is wrong.

```
[ ] UTM parameters on all paid campaigns (Google Ads, Meta, email)
      Required: utm_source, utm_medium, utm_campaign
      Recommended: utm_content, utm_term
[ ] Auto-tagging enabled in Google Ads (GCLID populates automatically)
[ ] Google Ads linked to GA4 property
[ ] No UTMs on internal links (causes session fragmentation — every click looks like a new source)
[ ] Redirect chains preserve UTM parameters (check with redirect checker tool)
[ ] Payment provider correctly excluded from referral sources
      Common offenders: stripe.com, paypal.com, worldpay.com, sagepay.com
[ ] Cross-domain tracking configured if user passes through external booking/payment domain
[ ] Default channel groupings checked — "Organic Social" vs "Paid Social" correctly separated
```

### Phase 1E — Data Quality Sanity Checks

Before trusting any number in GA4:

```
[ ] Sessions count vs server-side sessions (within 10% tolerance is acceptable)
[ ] Transaction count vs payment processor records (within 5% tolerance)
[ ] Revenue in GA4 vs revenue in booking/ecommerce platform (within 5%)
[ ] Bounce rate is plausible (>90% suggests GA4 not firing on key pages; <5% suggests duplicate sessions)
[ ] Average session duration is plausible (under 10 seconds for most pages = GA4 issue)
[ ] New vs returning user ratio is plausible for the business type
[ ] No single day spikes or drops that don't correspond to real events (tag deployment errors)
[ ] Mobile vs desktop ratio matches industry benchmarks for vertical
```

**Document discrepancies with:**
- What the discrepancy is (e.g. "GA4 shows 247 bookings, booking platform shows 312")
- Likely cause (e.g. "cookie consent opt-outs, cross-domain gap")
- Impact on analysis (e.g. "assume ~20% undercount on bookings — adjust conversion rates accordingly")
- Fix required before testing (e.g. "implement server-side tagging for purchase event")

---

## Part 2A — Full Funnel Analysis

Once the tag audit gives sufficient confidence in the data (or discrepancies are documented), run the full funnel analysis. This becomes the foundation for all hypothesis prioritisation.

### The Funnel Analysis Matrix

For each client, build this matrix in GA4 Funnel Exploration (Explore → Funnel Exploration):

**Step 1 — Build the closed funnel in GA4:**
- Add each funnel event as a step (in order)
- Set type to "Closed" funnel (users must follow steps in order)
- Date range: minimum 90 days (longer for low-traffic clients)
- Apply no filters initially — see the full picture first

**Step 2 — Record baseline funnel metrics:**

| Stage | Event | Users entering | Users completing | Drop-off % | Avg time to next step |
|---|---|---|---|---|---|
| 1 | Landing | — | X | — | — |
| 2 | Consideration | X | Y | (X-Y)/X % | Xm Ys |
| 3 | Selection/Intent | Y | Z | (Y-Z)/Y % | Xm Ys |
| ... | ... | ... | ... | ... | ... |
| N | **Conversion** | A | B | (A-B)/A % | — |

**The highest drop-off % is the biggest CRO opportunity.** This is where to look first.

### Segmentation Dimensions — Run Funnel for Each

Run the complete funnel matrix three times, segmenting by:

#### Dimension 1 — Device Category
Compare: Desktop / Mobile / Tablet

**What to look for:**
- Which device has the worst drop-off at which stage?
- Is mobile converting significantly worse than desktop? (Common — mobile UX usually has more friction)
- Is there a specific stage where mobile drop-off spikes? (Often checkout on mobile — form usability)
- Does desktop show better conversion at the same stages? (Confirms it's UX, not offer/messaging)

**Key question:** If mobile converts at 40% of the desktop rate, the mobile funnel is the priority — not the desktop funnel.

#### Dimension 2 — Source / Medium
Compare: organic / google (Organic Search) / cpc / google (Paid Search) / email / (direct) / (none) / social

**What to look for:**
- Which traffic sources enter the funnel at the highest volume but convert worst?
- Which sources convert best — and why? (Intent alignment, landing page match, audience quality)
- Is paid traffic converting worse than organic despite higher cost? (Landing page mismatch)
- Does email traffic convert better? (Higher intent — these users already know the brand)
- Is direct traffic unusually high? (May indicate attribution failure — UTMs missing)

**Key question:** If paid search converts at 1.2% and organic converts at 3.4%, the paid landing page or audience targeting is the problem — CRO on the page won't fix a misaligned campaign.

#### Dimension 3 — Campaign (for paid traffic only)
Compare: individual campaign names from utm_campaign parameter

**What to look for:**
- Which specific campaigns drive the most conversions vs most traffic?
- Which campaigns have high click-through but terrible funnel conversion? (Message mismatch)
- Which campaigns reach Stage 3+ but drop at checkout? (Price/trust issue specific to that audience)
- Are brand campaigns converting significantly better than non-brand? (Expected — note the gap)

**Key question:** Campaign-level funnel data can reveal that one underperforming campaign is dragging down the average — removing or fixing it may be higher ROI than a page redesign.

### Stage-Level Deep Dive

For every stage where drop-off exceeds 40%, run a deeper analysis:

**Quantitative (in GA4):**
- Which pages are users on when they drop off? (Page path report)
- What is the scroll depth at drop-off? (Did they even see the next step?)
- How long do users spend at the drop-off stage? (Too fast = didn't read; too slow = confused)
- Which device/source combination has worst drop-off at this stage?
- Is drop-off worse on entry from certain campaigns? (Intent mismatch arriving at wrong stage)

**Qualitative (in VWO Insights):**
- Session recordings filtered to: users who reached this stage AND dropped off
- Heatmaps on the specific page where drop-off occurs
- Look for: rage clicks, dead clicks, scroll stopping points, form abandonment patterns

**Output:** A prioritised list of stages with evidence of WHY the drop-off is happening — not just that it's happening.

---

## Part 3 — Funnel Analysis Report Template

Produce this report for every new client before writing the first hypothesis. Update quarterly.

```
CLIENT: [Name]
PERIOD: [Date range]
DATA CONFIDENCE: [High / Medium / Low — based on tag audit findings]
KNOWN DATA GAPS: [Document discrepancies here]

═══════════════════════════════════
OVERALL FUNNEL PERFORMANCE
═══════════════════════════════════
Total users entering funnel:     X
Total primary conversions:       Y
Overall funnel conversion rate:  Y/X %
Primary KPI:                     [bookings / leads / purchases / etc.]
Reporting currency:              [GBP / AUD / USD]

═══════════════════════════════════
TOP 3 DROP-OFF POINTS
═══════════════════════════════════
1. Stage [N] → Stage [N+1]: [X]% drop-off
   Worst device:  [Mobile/Desktop] at [X]% drop-off
   Worst source:  [source/medium] at [X]% drop-off
   Qualitative evidence: [what recordings/heatmaps show]

2. Stage [N] → Stage [N+1]: [X]% drop-off
   [same structure]

3. Stage [N] → Stage [N+1]: [X]% drop-off
   [same structure]

═══════════════════════════════════
BY DEVICE
═══════════════════════════════════
Desktop conversion rate:  X%   [X% of sessions]
Mobile conversion rate:   X%   [X% of sessions]
Tablet conversion rate:   X%   [X% of sessions]
Mobile/Desktop gap:       [Mobile is X% of desktop rate]

Key mobile drop-off stage: Stage [N] — [X]% worse than desktop

═══════════════════════════════════
BY SOURCE / MEDIUM
═══════════════════════════════════
| Source/Medium          | Sessions | Conversions | CVR   | vs avg |
|------------------------|----------|-------------|-------|--------|
| organic / google       | X        | Y           | X%    | +/-X%  |
| cpc / google           | X        | Y           | X%    | +/-X%  |
| email / campaign       | X        | Y           | X%    | +/-X%  |
| (direct) / (none)      | X        | Y           | X%    | +/-X%  |
| [other sources]        | X        | Y           | X%    | +/-X%  |

═══════════════════════════════════
HYPOTHESIS PRIORITIES (from this data)
═══════════════════════════════════
1. [Stage / device / source combination with biggest opportunity]
   Evidence: [specific data point]
   Recommended test type: [BIG / MEDIUM / SMALL]

2. [Next priority]
   Evidence: [specific data point]
   Recommended test type: [BIG / MEDIUM / SMALL]

3. [Next priority]
   Evidence: [specific data point]
   Recommended test type: [BIG / MEDIUM / SMALL]

═══════════════════════════════════
TAG AUDIT STATUS
═══════════════════════════════════
GA4 property verified:       ✅ / ⚠️ / ❌
GTM container verified:      ✅ / ⚠️ / ❌
All funnel events firing:    ✅ / ⚠️ / ❌
VWO-GA4 integration active:  ✅ / ⚠️ / ❌
UTM attribution clean:       ✅ / ⚠️ / ❌
Data vs platform match:      ✅ / ⚠️ / ❌

Outstanding issues:
[ ] [Issue 1 — owner — deadline]
[ ] [Issue 2 — owner — deadline]
```

---

## Part 4 — VWO Funnel Setup

VWO has its own funnel feature. Use it alongside GA4 — they serve different purposes.

**VWO Funnels vs GA4 Funnels:**

| | VWO Funnel | GA4 Funnel |
|---|---|---|
| **Best for** | Test-specific funnel during an active experiment | Baseline funnel analysis before and after tests |
| **Segmentation** | Control vs Variation comparison | Device, source, campaign, audience |
| **Time granularity** | Test duration only | Historical + ongoing |
| **Purpose** | Did this test move users through the funnel differently? | Where in the funnel is the biggest opportunity? |

**Setting up VWO Funnels for test analysis:**

For every active test, create a VWO Funnel that includes:
1. The page/event being tested (the intervention point)
2. Every subsequent funnel stage to the primary conversion
3. Compare Control vs Variation side by side

This tells you not just whether the variation converted better — but *where* in the downstream funnel the difference appeared. A variation that improves Stage 2→3 but collapses Stage 5→6 is not a clean win.

**VWO Funnel configuration:**
- Navigate to: VWO → Insights → Funnels → Create Funnel
- Add steps using page URLs or event conditions
- Enable "Compare by Variation" once a test is running
- Minimum 200 users per funnel step for reliable percentages

---

## Part 5 — Ongoing Cadence

| Frequency | Activity | Owner |
|---|---|---|
| **Before first test** | Full tag audit (Part 1) + baseline funnel analysis (Part 2) | CRO lead |
| **Monthly** | Funnel performance check — are drop-off rates changing? | CRO lead |
| **Monthly** | Lightweight tag sanity check — are all events still firing? | CRO lead |
| **After every site change** | Re-run Phase 1B event verification for affected pages | Dev + CRO lead |
| **After every GTM publish** | GTM Preview Mode verification before publish | Dev |
| **Quarterly** | Full funnel analysis report refresh | CRO lead |
| **After every test concludes** | Update funnel report with test impact on stage-level drop-off | CRO lead |

**Trigger for ad-hoc audit:**
- New checkout flow deployed
- Payment provider changed
- Major navigation or page structure change
- Sudden unexplained drop in conversion rate (>15% week-on-week)
- New campaign type launched (different UTM structure)
- VWO updated or test configuration changed

---

## Part 6 — Tools Reference

| Tool | Purpose | Access |
|---|---|---|
| GA4 DebugView | Real-time event verification during tag testing | GA4 → Admin → DebugView |
| GTM Preview Mode | Test tags before publishing, inspect data layer | GTM → Preview |
| Google Tag Assistant | Browser extension — verifies tags firing on live site | Chrome extension |
| GA4 Funnel Exploration | Build and analyse conversion funnels by segment | GA4 → Explore → Funnel exploration |
| GA4 Path Exploration | See what users do before/after key events | GA4 → Explore → Path exploration |
| VWO Funnels | Test-specific funnel analysis, control vs variation | VWO → Insights → Funnels |
| VWO Heatmaps | Where users click/tap on specific pages | VWO → Insights → Heatmaps |
| VWO Session Recordings | Watch real user sessions, filter by funnel stage | VWO → Insights → Recordings |
| GA4 Realtime Report | Sanity check — is GA4 receiving data right now? | GA4 → Reports → Realtime |
| Chrome DevTools Network tab | Verify GA4 collect calls and VWO data push | F12 → Network → filter "collect" |


## Part 2B — New vs Returning User Analysis

New and returning users are not the same funnel. They have different intent, different familiarity with the brand, and different reasons for dropping off at each stage. Mixing them produces a blended CVR that misrepresents both.

### Why this split is non-negotiable

A returning user who has booked before knows the product, trusts the brand, and is in the funnel to book again. Their drop-off signals friction in the process (form usability, payment issues, availability).

A new user is still evaluating. Their drop-off signals trust gaps, unclear value propositions, or a mismatch between what the ad promised and what the page delivers.

A test designed to fix a new-user trust problem (e.g. adding social proof above the fold) will be diluted if returning users — who don't need social proof — are included in the sample. The test may show a small positive lift overall and get dismissed, when actually it produced a significant lift for the segment it was designed for.

**Rule: Always run new vs returning as a dimension on every funnel analysis. Always segment test results by this dimension post-test.**

### How to build the split in GA4

In GA4 Funnel Exploration:
1. Build the funnel as normal
2. Click "Breakdown" → select "New/Established" (GA4's terminology for new/returning)
3. The funnel view now shows two parallel funnels side by side

**Alternative using segments:**
- Create Segment A: `newVsReturning = "new"`
- Create Segment B: `newVsReturning = "returning"`
- Apply both to the same exploration — gives side-by-side comparison

### What to look for

| Pattern | Diagnosis |
|---|---|
| New users drop heavily at Stage 1→2, returning users don't | Trust/familiarity problem — new users don't understand the offer |
| Both drop equally at the same stage | Process problem — the friction affects everyone regardless of familiarity |
| Returning users convert 3–5× higher overall | Normal for most verticals — but check if returning are masking a new-user crisis |
| New users convert better than returning at a specific stage | Unusual — investigate. May signal returning users are blocked by a known bug or account issue |
| Mobile new users show worst performance | Expected — high-intent returning users tend to use desktop; cold mobile traffic is lowest intent |

### Vertical-specific benchmarks

| Vertical | Expected returning/new CVR ratio | If ratio is lower | If ratio is higher |
|---|---|---|---|
| Leisure/activity booking | 4–6× | Returning users experiencing friction (booking system, account login) | New user journey has unusually high trust signals |
| Financial services | 6–10× | New user journey may be over-qualifying (too much friction) | Returning users may be re-applying due to rejection — investigate quality |
| Ecommerce | 2–4× | High churn — returning users aren't staying loyal | Strong loyalty programme or email nurture working well |
| SaaS | 3–5× (trial to paid) | Onboarding not activating new users | Product has strong immediate value — good sign |
| Lead generation | 3–6× | New user landing page is weak | Strong remarketing programme |

### Applying to test segmentation in VWO

When setting up any test in VWO:
1. Check whether the hypothesis targets new users, returning users, or both
2. If the fix is for new users — set VWO to show variation only to new users (Visitor condition: `is_returning = false`)
3. If the fix is for returning users — target returning users only (`is_returning = true`)
4. If testing all users — plan post-test segmentation before launch, so you know you'll split results by user type when analysing

**Never declare a test inconclusive without checking the new vs returning split.** A flat overall result frequently conceals a strong positive for one segment cancelled out by a negative or neutral for the other.

---


## Part 2C — Traffic Intent Scoring

The single biggest mistake in CRO reporting is treating all traffic as equal. A first-time visitor arriving from a Meta prospecting ad has a fundamentally different intent level from a returning customer clicking a re-engagement email. They should never share a CVR number and never be pooled in the same test analysis.

The Traffic Intent Score gives every session segment a single number (1–10) that represents its expected conversion ceiling based on three dimensions:

```
Intent Score = (User Type Score × 0.40) + (Source Intent Score × 0.40) + (Device Score × 0.20)
```

### Dimension 1 — User Type Score (40% weight)

| User type | Score | Rationale |
|---|---|---|
| Returning — 3+ visits | 10 | Demonstrated loyalty. In the funnel to transact. |
| Returning — 2 visits | 8 | Familiar with brand. Likely evaluating. |
| New — referral from known source | 6 | Some context/endorsement. Warmer than cold. |
| New — organic search (branded) | 7 | Searching the brand by name — high intent. |
| New — organic search (generic) | 5 | Category intent, brand unknown. |
| New — paid search (branded) | 7 | High intent — specifically sought brand. |
| New — paid search (generic) | 4 | Category awareness only. |
| New — social/display (retargeted) | 5 | Has seen brand before. Middling intent. |
| New — social/display (cold) | 2 | Discovery/awareness. Lowest purchase intent. |
| New — direct/unknown | 4 | Likely attribution failure. Treat as unknown. |

### Dimension 2 — Source Intent Score (40% weight)

| Source / Medium | Score | Intent signal |
|---|---|---|
| email / newsletter | 10 | Opted in, knows the brand, clicked deliberately |
| organic / google (branded) | 9 | Searched brand by name — active intent |
| direct / (none) | 7 | Memorised URL or bookmarked — strong familiarity |
| organic / google (non-branded) | 6 | Category search — product intent, brand TBD |
| cpc / google (branded) | 8 | Actively looking for this brand specifically |
| cpc / google (non-branded) | 5 | Problem-aware, evaluating options |
| organic / social | 4 | Content engagement, not purchase intent |
| cpc / meta (retargeting) | 5 | Has seen brand, needs nudge |
| cpc / meta (cold) | 2 | Interrupted by ad. No active intent. |
| cpc / meta (lookalike) | 3 | Demographically similar. Intent unknown. |

### Dimension 3 — Device Score (20% weight)

| Device | Score | Rationale |
|---|---|---|
| Desktop | 8 | Longer sessions, deliberate browsing, more likely to complete complex forms |
| Tablet | 6 | Mixed — leisure browsing but capable of completing transactions |
| Mobile | 4 | Shorter sessions, higher friction on complex journeys, lower purchase completion |

*Note: Mobile scores lower for transaction completion, not for value. A mobile user with score 8 source intent still scores higher than a desktop user with score 2 source intent. Score the dimension, then weight.*

### Scoring Examples

**Powerleague — highest intent segment:**
Returning user (10) × 0.40 = 4.0
Email / newsletter (10) × 0.40 = 4.0
Desktop (8) × 0.20 = 1.6
**Total: 9.6 → Score 9–10 tier. Expected CVR: 5–8%**

**Powerleague — lowest intent segment:**
New user / cold (2) × 0.40 = 0.8
Meta CPC cold (2) × 0.40 = 0.8
Mobile (4) × 0.20 = 0.8
**Total: 2.4 → Score 1–3 tier. Expected CVR: 0.3–0.6%**

The 9.6 vs 2.4 scoring explains a CVR gap of 15–25× before any page design is considered. This is not a CRO problem — it is a traffic quality and channel strategy problem.

### Intent Score Tiers and Their Implications

| Tier | Score range | Expected CVR ceiling | CRO priority |
|---|---|---|---|
| Very high intent | 8–10 | 4–10% | Fix friction — they want to buy but something stops them |
| High intent | 6–8 | 2–4% | Optimise consideration and comparison stages |
| Medium intent | 4–6 | 0.8–2% | Trust-building and proof are the levers |
| Low intent | 2–4 | 0.3–0.8% | Nurture, not conversion — retargeting and email capture |
| Very low intent | 1–2 | < 0.3% | Not a CRO problem. Audience strategy problem. |

### How to use intent scoring in test design

**1. Pre-test: identify target segment**
Before writing a hypothesis, state which intent tier it targets. A test designed for Tier 5 (very low intent) will waste budget and produce noise. Every test should target Tier 3 or above.

**2. During test: consider segment-specific traffic splits**
If a test page receives a mix of Tier 1 and Tier 5 traffic, the Tier 5 traffic will dilute results. Options:
- Target the test only to Tier 3+ segments using VWO visitor conditions (source = email OR returning = true)
- Run the test on all traffic but pre-plan segmented analysis
- Accept the dilution and account for it in minimum sample size calculation

**3. Post-test: always report by intent tier**
A flat overall result on a test for Tier 1 users almost certainly contains a win inside it. Pull results segmented by:
- New vs returning
- Organic vs paid vs email
- Desktop vs mobile

Report the segment results alongside the overall result. A client who sees "0.2% lift, not significant" responds differently to "2.1% lift for returning email users on desktop, -0.4% for cold mobile traffic — confirming the hypothesis works for its target segment."

**4. Personalisation as the next step**
When intent scoring reveals a significant CVR gap between segments that cannot be closed with a single variation, the answer is personalisation, not more A/B testing. VWO Personalise can serve different page versions to different intent segments. Intent score directly informs which segments get which experience.

### Updating the intent score over time

Intent scores are not fixed. Review quarterly:
- Has a traffic source changed character? (e.g. an email list that has been over-mailed has lower intent scores)
- Has a new paid campaign changed the composition of paid traffic?
- Has a seasonal event skewed the new/returning mix?
- Are scores consistent with observed CVRs, or do they need recalibrating?

Document score changes in the client's `clients/[client]/scoring.md` file with dates.


## Part 2D — Intent-Adjusted Benchmark Index

### The problem with raw CVR comparisons

Comparing Brand CPC at 3.2% against Meta prospecting at 0.4% and saying "Meta is underperforming" is wrong. Meta prospecting is a Tier 2 source. 0.4% is exactly what a Tier 2 source should produce. There is no CRO problem there.

Comparing Brand CPC at 3.2% against an expected Tier 7 rate of 3.5% and getting an index of 91 is interesting. That segment is slightly below where it should be. Worth watching, but within variance.

Comparing returning email users at 2.6% against an expected Tier 9 rate of 5.8% and getting an index of 45 — that is a genuine CRO flag. High-intent traffic that should be converting at nearly 6% is converting at less than half that. Something on the page is losing people who came ready to buy.

The index makes that distinction. Raw CVR does not.

---

### The formula

```
Index = (Observed rate ÷ Expected rate for intent tier) × 100 × Stage weight

Where:
  Observed rate  = actual CVR or stage pass rate for this segment
  Expected rate  = benchmark CVR for this intent tier (from table below)
  Stage weight   = amplifier based on funnel position (see below)
```

---

### Expected CVR benchmarks by intent tier and vertical

These are the denominators for the index calculation. Based on universal patterns across verticals — recalibrate per client once 90 days of data is available (see scoring.md recalibration format).

| Tier | Segment type | Leisure | Lead gen / BFSI | Ecommerce | SaaS |
|---|---|---|---|---|---|
| 1 | Cold social, new user | 0.3% | 0.2% | 0.4% | 0.3% |
| 2 | Prospecting social, new user | 0.5% | 0.4% | 0.6% | 0.5% |
| 3 | Generic paid, mobile, new | 0.9% | 0.7% | 1.0% | 0.8% |
| 4 | Generic paid, desktop, new | 1.6% | 1.2% | 1.8% | 1.5% |
| 5 | Organic / direct, new user | 2.1% | 1.8% | 2.4% | 2.0% |
| 6 | Brand CPC / organic, new | 2.8% | 2.4% | 3.2% | 2.8% |
| 7 | RLSA / retargeting | 3.5% | 3.0% | 4.0% | 3.4% |
| 8 | Returning / direct | 4.4% | 3.8% | 5.0% | 4.2% |
| 9 | Returning email (promotional) | 5.8% | 5.0% | 6.5% | 5.5% |
| 10 | Returning email (abandoned intent) | 8.0% | 7.0% | 9.0% | 7.5% |

**Important:** These are final CVR benchmarks (primary KPI). For funnel stage pass rates, apply the stage multipliers below.

---

### Stage weights

The stage weight amplifies the index signal at the most important funnel points. A segment underperforming at the primary KPI stage is more urgent than the same underperformance at a mid-funnel stage.

| Funnel position | Stage weight | Rationale |
|---|---|---|
| Primary KPI (final conversion) | 1.5× | Directly drives revenue — highest urgency |
| Highest drop-off stage | 1.2× | The known problem stage — signals count more |
| Mid-funnel stage | 1.0× | Standard weight |
| Low-impact / micro stage | 0.8× | Directional only — low urgency if underperforming |

**Weighted index = raw index × stage weight**

A raw index of 60 at the primary KPI stage produces a weighted index of 90 — still amber.
A raw index of 60 at a mid-funnel stage produces a weighted index of 60 — red flag.

---

### Index interpretation

| Weighted index | Status | Action |
|---|---|---|
| 120+ | Outperforming | Investigate the replicable factor — what is driving this? Apply to similar segments. |
| 80–119 | Within variance | Monitor. No immediate CRO action. |
| 60–79 | Underperforming | CRO opportunity. Traffic is qualified but something on the page is losing them. Prioritise for hypothesis generation. |
| <60 | Urgent flag | High-intent traffic converting well below its ceiling. Investigate with session recordings and heatmaps immediately. |

---

### Critical distinction — CRO problem vs traffic quality problem

**Index below 80 on a high-intent segment (Tier 7–10):**
This is a CRO problem. The traffic arrived with intent. Something on the page, in the funnel, or in the experience is failing them. Run heatmaps, session recordings, and form analytics. Generate hypotheses. Test.

**Index below 80 on a low-intent segment (Tier 1–3):**
This is almost never a CRO problem. Tier 1–3 traffic is in discovery mode. It should not convert at the rate of Tier 7–10 traffic. Attempting to CRO Tier 1 traffic into immediate converters is the wrong approach — the correct response is to optimise for the right metric for that tier (exploration depth, return visit rate, retargeting audience quality).

**Index at 100 on a low-intent segment:**
Interesting signal. This segment is converting at exactly its intent-predicted rate. If it's Tier 2 at index 100, that's fine — expected. If it's Tier 1 at index 100+, that means your discovery experience is genuinely driving intent — investigate and replicate.

---

> Stage-level benchmarks by intent tier (PLP→PDP, PDP→ATC, etc.) live in `brain/funnel-kpis.md` — Funnel Stage Benchmarks section. Use them as the denominator for stage-level index calculations alongside the final CVR denominators in the table above.

### Building the index in GA4

**Step 1 — Segment your funnel by source/medium + user type + device**
Use the segment comparison in GA4 Funnel Exploration. You need separate funnel runs for each major segment combination.

**Step 2 — Record observed CVR and stage pass rates**
Export the funnel table to the flat file format (see Part 3 report template).

**Step 3 — Assign intent tier to each segment**
Use the pre-conception table from `brain/personalisation-strategy.md`. Note: use Level 2 (campaign name inference) if Level 1 (query data) is unavailable for Google CPC.

**Step 4 — Pull expected benchmark from the table above**
Match vertical and tier to get the expected CVR.

**Step 5 — Calculate raw index and weighted index**
`raw_index = round((observed / expected) × 100)`
`weighted_index = round(raw_index × stage_weight)`

**Step 6 — Flag and prioritise**
Any segment with weighted index below 80 on Tier 5+ goes on the CRO opportunity list with supporting evidence. Any segment with weighted index below 60 goes to the top of the hypothesis backlog regardless of P.I.E. score.

---

### Index in the flat file export

Add these columns to the segment matrix CSV:

```
intent_tier          integer   1–10
expected_cvr_pct     decimal   from benchmark table
raw_index            integer   observed/expected × 100
stage_weight         decimal   1.5 / 1.2 / 1.0 / 0.8
weighted_index       integer   raw_index × stage_weight
index_status         string    outperforming / on_target / underperforming / urgent
cro_flag             boolean   true if weighted_index < 80 AND tier >= 5
```

The `cro_flag` column is the actionable output. Filter this column to `true` and you have your prioritised CRO opportunity list, already sorted by weighted index ascending (worst underperformers first).

---

### Recalibrating benchmarks over time

After 90 days of client-specific data, compare the universal benchmarks against observed CVRs for each tier. If the client consistently outperforms or underperforms the benchmark for a given tier, update `clients/[client]/scoring.md`:

```yaml
## Intent benchmark recalibrations
# Universal → client-specific adjustments after 90-day validation

tier_9_email_promo:
  universal_expected_cvr: 5.8%
  client_observed_cvr: 3.1%
  recalibrated_expected: 3.1%
  reason: Email list is content-led not promotional — lower purchase intent
  date_validated: 2026-06-01

tier_7_rlsa:
  universal_expected_cvr: 3.5%
  client_observed_cvr: 5.2%
  recalibrated_expected: 5.2%
  reason: Retargeting audience is tight (product page visitors only, not all site visitors)
  date_validated: 2026-06-01
```

Once recalibrated, the client's index scores use their own benchmarks — not the universal ones. This is the system learning from client-specific data over time.

---


## Part 2E — Segment Viability: MDE-Based Thresholds

### The right question

Do not ask: "does this segment have enough conversions?"

Ask: "given this segment's traffic and CVR, what is the smallest lift I could reliably detect within the maximum window — and is that good enough to be worth indexing?"

A segment with 20 conversions at 4% CVR has a much tighter MDE profile than one with 20 conversions at 0.5% CVR. A hard count threshold misses that entirely.

---

### The formula

```
Achievable MDE (relative) =
  (Z_α/2 + Z_β) × √(2p(1−p) / n_per_variant) / p

Where:
  Z_α/2 + Z_β  = 1.96 + 0.84 = 2.80  (95% significance, 80% power)
  p            = segment baseline CVR
  n_per_variant = (segment weekly sessions × window weeks) / 2

To find weeks needed to hit a target MDE:
  n_needed = (Z / MDE_absolute)² × 2p(1−p)
  weeks    = ceil((n_needed × 2) / weekly_segment_sessions)
```

The target MDE is **15% relative** by default. This means: if the true effect is at least 15% relative improvement (e.g. 2.0% → 2.3% CVR), the test would detect it. A segment that needs a 40% lift to be detectable is not a segment worth indexing — you'd only catch enormous effects and miss everything useful.

---

### Viability tiers

| Status | Condition | Action |
|---|---|---|
| Viable | Achieves target MDE within 8 weeks | Index and test standalone |
| Extend window | Achieves target MDE within 9–20 weeks | Use longer analysis window (Rule 5) |
| Aggregate | Cannot achieve target MDE even at 20-week max | Merge with adjacent intent-tier segment |

The 20-week cap is Rule 5. Beyond 20 weeks, seasonal effects contaminate the baseline and the analysis period spans two different trading environments. Do not extend past 20 weeks — aggregate instead.

---

### Aggregation — merge adjacent intent tiers, not random segments

When a segment must be aggregated, merge with the nearest intent-tier neighbour. Never merge segments from opposite ends of the intent spectrum — that destroys the intent signal entirely.

**Good merges (adjacent tiers):**
- New · generic paid desktop + New · generic paid mobile → New · generic paid (all devices)
- New · organic desktop + New · organic mobile → New · organic (all devices)
- Returning · email promo + Returning · email abandon → Returning · email (all)
- Returning · direct desktop + Returning · paid RLSA → Returning · high-intent (direct + RLSA)

**Bad merges (incompatible intent):**
- New · paid social + Returning · email — Tier 2 mixed with Tier 9, destroys signal
- New · generic CPC + Returning · direct — completely different intent profiles
- Any new user segment merged with any returning user segment

**Rule:** when merging, the blended segment inherits the lower of the two intent tiers for indexing purposes. This is conservative — it avoids over-crediting the merged group.

---

### Segment-level MDE in practice

For each segment in the analysis:

1. Pull weekly sessions and CVR from GA4 (90-day average)
2. Calculate weeks needed to hit 15% relative MDE
3. Classify as viable / extend / aggregate
4. For aggregate segments, find the best adjacent merge and recalculate
5. If the merged segment is still aggregate at 20 weeks — note as directional only in the report, do not use for hypothesis prioritisation

Record in the segment matrix CSV:

```
weekly_sessions_seg    integer
baseline_cvr_seg       decimal
weeks_to_target_mde    integer
mde_at_max_window      decimal   (% relative, at 20-week cap)
viability_status       string    viable / extend / aggregate
merged_with            string    null or segment name merged into
blended_intent_tier    integer   lower tier if merged
```

---

### The one exception — high-intent segments on low-traffic sites

Returning email (abandon) is typically 2% of sessions on most sites. On a 500 session/week site that is 10 sessions/week — almost nothing. But this segment is Tier 10. Its CVR is genuinely ~8%. Its absolute conversion count per week is therefore 0.8 — far below what any MDE calculation would accept.

Do not drop this segment. Keep it as directional index only, with a note that it cannot be used for hypothesis prioritisation until the site grows. The reason: even a directional index of 45 on your highest-intent segment is critical signal that something is broken for your most valuable users. You can investigate with session recordings and heatmaps without needing a statistically powered test.

The rule: **if intent tier ≥ 9 and observed CVR is more than 30% below the benchmark, flag as urgent regardless of segment size.** Investigate qualitatively — do not wait for statistical power.

---

### Target MDE — when to adjust

15% relative is the default. Override it when:

| Situation | Adjusted target | Reason |
|---|---|---|
| High-revenue page (primary KPI, high AOV) | 10% relative | Smaller effects still worth finding |
| Micro-conversion or engagement metric | 20% relative | Larger effects expected, less precision needed |
| Client is in early-stage testing programme | 20% relative | Orientation phase — large signals only |
| Client has proven programme, Stage 3+ maturity | 10% relative | Mature programme, incremental gains matter |

Store the per-client MDE target in `clients/[client]/scoring.md`:

```yaml
mde_target_relative_default: 15%
mde_target_primary_kpi: 10%
mde_target_micro_conversion: 20%
```

---
