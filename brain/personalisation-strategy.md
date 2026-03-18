# Intent-Based Personalisation Strategy

**Purpose:** Define what experience each intent tier should see, what to test within each tier, and how to measure success correctly per tier. This file governs all personalisation campaigns in VWO and all tier-specific A/B test design.

**Core principle:** CVR is not a universal metric. A cold Meta mobile user and a returning email desktop user should never share a primary KPI. Measuring cold discovery traffic by booking rate is the wrong question. The right question for that tier is: did we capture them for later?

---

## The Framing Shift

**Old thinking:** Cold Meta traffic has 0.19% CVR — should we cut the budget?

**Correct thinking:** Cold Meta traffic has 0.19% booking rate on a page designed for someone ready to buy. That is an experience mismatch problem. The traffic has value — it is building a future audience. The job of CRO for that tier is to capture intent signals (email, micro-conversions) that enable a future session where they will convert at a much higher rate.

**Conversely:** A returning user arriving from a brand email has already done their evaluation. They do not need brand explanation, social proof, or feature education. Every second they spend reading content they already know is a second of friction between them and the booking. The job of CRO for that tier is to remove every obstacle between arrival and payment.

Same page for both is wrong. Personalisation is the answer.

---

## Tier 5 — Returning, high-intent sources (Score 8–10)

**Who:** Returning visitors from email, organic branded search, direct
**CVR ceiling:** 4–10%
**Primary metric:** Bookings completed
**Secondary metric:** Checkout start rate
**What they need:** The fastest possible path to completing what they came to do

### Experience design
- Hero copy is outcome-focused, not brand-explaining ("Book your next session" not "The UK's best football parties")
- CTA is above the fold, prominent, requires no scrolling
- Location selector surfaced immediately — this is the Stage 3→4 fix for this segment
- Suppress all trust-building content — reviews, accreditation badges, brand story. They know.
- If data permits: pre-fill last-used venue or surface it as a suggested option
- Live availability signal if possible ("12 slots this weekend")
- No distractions — nav can be suppressed or simplified

### VWO setup
```
Campaign type: Personalise
Condition: visitor.returningVisitor == true
           AND traffic.medium IN ['email', 'organic']
           AND (traffic.source == 'direct' OR traffic.keyword CONTAINS '[brand name]')
Primary goal: purchase / booking_completed event
```

### Test ideas for this tier
- Location selector position (above vs below package selection)
- Removing trust content entirely vs keeping it
- Pre-filled venue suggestion vs open selector
- Urgency signal (availability count) vs no urgency signal

---

## Tier 4 — New, high-intent, desktop (Score 5–8)

**Who:** New visitors from organic non-branded, paid search, referral — on desktop
**CVR ceiling:** 1.5–4%
**Primary metric:** Package selection rate (leading), bookings completed (lagging)
**Secondary metric:** Scroll depth to packages, time on page
**What they need:** Fast trust-building. Clear value proposition. Frictionless evaluation.

### Experience design
- Hero: benefit-led headline targeting the emotional outcome ("Football parties kids actually love")
- Value proposition clear within 3 seconds — no need to scroll to understand what this is
- Trust signals near CTA: one strong review quote, a credibility number, accreditation
- Package comparison visible above or just below the fold
- Location selector surfaced before package selection — prevents the Stage 3→4 cliff
- One testimonial with a real name and real context — not a carousel of five
- Standard booking flow — these users are evaluating, not rushing

### VWO setup
```
Campaign type: A/B Test or Personalise
Condition: visitor.returningVisitor == false
           AND visitor.deviceType == 'desktop'
           AND traffic.medium IN ['organic', 'cpc', 'referral']
           AND traffic.source != 'meta'
Primary goal: select_item event (package selection rate)
Secondary goal: begin_checkout event
```

### Test ideas for this tier
- Headline framing: benefit-led vs feature-led vs social proof-led
- Trust signal placement: above vs below the packages
- Location selector: surface before vs after package selection
- Package presentation: card comparison vs single recommended package

---

## Tier 3 — New, medium intent, mobile (Score 4–6)

**Who:** New visitors from organic/paid search arriving on mobile
**CVR ceiling:** 0.8–1.8% booking; 4–8% email capture
**Primary metric:** Bookings completed + email captures combined (total downstream value)
**Secondary metric:** CTA click rate, email capture rate
**What they need:** Fast load, simplified experience, low-friction exit that keeps them in the funnel

### The key insight
Many of these users are in a research session. They will not book on mobile today. The correct response is not to force them through a 6-step booking funnel — it is to make it easy to continue later while capturing their email so you can bring them back.

A "Save for later / email me this" secondary CTA serves two purposes: it removes frustration from users who aren't ready, and it builds a warm audience for email retargeting. Those email captures, if they convert at even 8% within 30 days, are worth far more than the booking CVR suggests.

### Experience design
- Performance first — LCP under 2.5s on mobile is non-negotiable for this tier (see brain/performance.md)
- Single-column, thumb-friendly layout throughout
- Primary CTA: "Book now" — always present
- Secondary CTA: "Email me the details" — low friction, captures email, keeps them in the funnel
- Packages simplified on mobile — not a full comparison table, just the headline and price of each
- Phone number as click-to-call option (some users prefer this on mobile)
- Suppress non-essential content — this is not the page for brand storytelling

### VWO setup
```
Campaign type: A/B Test
Condition: visitor.returningVisitor == false
           AND visitor.deviceType == 'mobile'
           AND traffic.medium IN ['organic', 'cpc']
           AND traffic.source != 'meta'
Primary goal: purchase event + lead_capture event (combined)
Secondary goal: CTA click rate
```

### Test ideas for this tier
- Dual CTA (book now + email me) vs single CTA (book now only)
- Package presentation: full vs simplified cards
- Sticky CTA bar vs inline CTA
- Click-to-call button visible vs hidden

---

## Tier 2 — New, retargeted social (Score 2–4)

**Who:** Users who have previously seen a Meta ad or visited the site, returned via retargeting
**CVR ceiling:** 0.4–1% booking; 5–12% email capture
**Primary metric:** Email capture rate
**Secondary metric:** Return visit rate within 7 days
**What they need:** Nurturing, not selling. They know the brand exists. They need a reason to commit.

### Experience design
- Emotion-led hero: aspiration, not product ("The party they'll talk about for years")
- Heavy imagery or short video — this audience responds to visual, not rational copy
- Email capture as the primary CTA with a low-friction value exchange ("Get the pricing guide")
- Soft secondary CTA: "See what's included" — keeps them on the page without pressure
- Suppress pricing page — too early to make price the focus of the evaluation
- Social proof in UGC/review format — peer-to-peer trust is more effective than brand claims
- Match the creative and copy of the Meta ad that brought them — continuity reduces drop-off

### VWO setup
```
Campaign type: Personalise
Condition: traffic.source == 'meta'
           AND traffic.medium == 'cpc'
           AND visitor.campaignType == 'retargeting'
Primary goal: lead_capture event (email)
Secondary goal: return visit within 7 days (GA4 audience re-import)
```

### Test ideas for this tier
- Email capture incentive: pricing guide vs planning checklist vs nothing
- Hero format: static image vs short video
- Pricing visible vs hidden until email captured
- CTA copy: "Get the guide" vs "Show me the prices"

---

## Tier 1 — New, cold Meta, mobile (Score 1–2)

**Who:** First touch from cold Meta prospecting campaign, on mobile
**Correct primary metric:** Product explore rate, scroll depth >50%, 7-day return visit rate, retargeting audience size built
**Wrong metric (do not use):** Booking CVR — this measures a purchase decision from a browsing session. It will always be low and it tells you nothing useful.
**Secondary metric:** Retargeting CVR on return visit (the true downstream number)

### The framing

A cold Meta user was scrolling through their feed and an ad interrupted them. Their brain is in browse mode, not decision mode. They have no active intent to buy — they have curiosity, at best. The job of CRO for this tier is not to convert them now. It is to show them as much of the product as possible, let familiarity build naturally, and construct a retargeting audience that will convert on a future visit when intent has developed.

Forcing them into a single brand message or an email capture gate fights their natural behaviour and produces nothing. Working with their browse mode — maximum product visibility, frictionless exploration, no gates — builds genuine familiarity that converts later.

**The retail analogy:** someone walks into a shop for the first time. You do not block them at the door asking for their email. You let them browse. The sale happens after they have seen enough to want something. This tier is the browse phase.

**The social commerce analogy:** Instagram Shop and TikTok Shop both work this way. Product grid immediately. Tap to explore. Prices visible. No commitment required. Purchase intent builds through browsing, not through a funnel.

### Experience design

The goal is maximum product visibility and minimum friction on exploration:

- Surface the full product range immediately — all packages, all options, all price points
- Visual-first, image-heavy layout — scroll-native on mobile, matches the social feed behaviour they arrived from
- Prices visible — discovery includes understanding what things cost. Suppressing prices is counter-productive at this stage.
- Package detail expandable inline — tap to see more without a page jump or redirect
- Venue locator accessible — "see venues near you" is a high-intent action even from cold traffic
- Social proof woven into the product cards naturally — not a dedicated trust section
- Navigation present and usable — let them wander into other parts of the site if they want
- Ad creative continuity — the hero image/copy should match the Meta ad that brought them, reducing dissonance
- No popups, no interruptions, no gates — pure exploration

**Soft intent signals captured passively** (no action required from the user):
- Product detail tap → fires `product_explore` GA4 event → added to "engaged discovery" audience
- Scroll depth past 50% → fires `scroll` event → added to "substantive engagement" audience
- Venue locator interaction → fires `venue_browse` event → high-intent signal even from cold traffic
- Time on page > 30 seconds → session-level signal → added to "warm discovery" audience
- Image gallery swipe → engagement signal

After natural engagement has occurred (product explore event fired OR time > 60s), a single soft contextual CTA can surface: "Save this for later" or "Get full details sent to you" — but it follows engagement, it does not gate it.

### VWO setup
```
Campaign type: Personalise (modified product grid layout for this segment)
Condition: traffic.source == 'meta'
           AND traffic.medium == 'cpc'
           AND visitor.returningVisitor == false
           AND visitor.deviceType == 'mobile'
Primary goal: product_explore event (custom GA4 event — must be implemented)
Secondary goal: 7-day return visit (GA4 audience re-import to VWO)
Retargeting goal: booking CVR from this audience on return visit (30-day window)
```

### What to test within Tier 1

- **Layout:** Grid product layout vs scroll-story layout (one product at a time, swipe to next)
- **Card design:** Image-first vs price-first product cards
- **Breadth vs depth:** More products visible above fold vs fewer but more detailed
- **Venue locator placement:** Prominent (above packages) vs discoverable (within package cards)
- **Soft CTA timing:** Appears after product explore event vs appears after 30s time on page vs no soft CTA
- **Price visibility:** Prices visible vs "from £X" teaser vs price revealed on tap

### Reporting Tier 1 correctly

Do not report booking CVR for this tier in isolation. Report:

1. **Product explore rate** — what % of cold sessions engaged with at least one product in detail
2. **Engagement rate** — scroll depth >50%, time >30s
3. **Retargeting audience growth** — how many qualified discovery sessions added to Meta retargeting audience per week
4. **Return visit rate (7-day)** — did the discovery session create enough familiarity to bring them back
5. **Retargeting CVR** — booking rate from Tier 1 visitors on their return visit (this is the real number)

**The full attribution story:** Cold Meta session → 25% product explore → 8% return within 7 days → 1.5% booking CVR on return visit = true downstream CVR of ~0.3% from the original cold session. That is a completely different and far more honest picture than the raw 0.19% booking rate on the cold landing.

The cold session is not a cost centre. It is audience construction. The retargeting campaign that follows it — now aimed at people who have explored specific products — converts at a multiple of what cold retargeting would achieve.

---

Also update the Implementation Order section — replace the Tier 1 Phase 1 entry:

OLD:
2. Tier 1 — Cold Meta mobile: redirect to dedicated landing page (stops the biggest CVR distortion)

NEW:
2. Tier 1 — Cold Meta mobile: implement discovery-mode product grid experience (maximum visibility, no gates, passive intent signal capture — stops the CVR distortion AND starts building retargeting audience quality)

---

Also update the Measuring the Full Programme table — replace the Tier 1 row:

OLD:
| 1 — Cold Meta mobile | Email capture rate, 30-day downstream booking CVR | Booking CVR on landing page (completely wrong metric) |

NEW:
| 1 — Cold Meta mobile | Product explore rate, scroll depth >50%, 7-day return rate, retargeting CVR on return visit | Booking CVR on cold session (wrong tier, wrong metric, wrong session) |

## Dimension 1 — User Type Score (40% weight)

| User type | Score | Rationale |
|---|---|---|
| Returning — 3+ visits | 10 | Demonstrated loyalty. In the funnel to transact. |
| Returning — 2 visits | 8 | Familiar with brand. Likely evaluating. |
| New — from any source | varies | Score driven by Dimension 2 — source tells you more than newness alone |

---

REPLACE: ## Dimension 2 — Source Intent Score (40% weight)

WITH:

## Dimension 2 — Source Intent Pre-Conception Table (40% weight)

These are starting hypotheses — scored before you have client-specific CVR data. They represent universal patterns observed across verticals. Every score should be validated against real CVR on onboarding and recalibrated if the data disagrees.

### Google / CPC

| Campaign type | Score | Why | What to check |
|---|---|---|---|
| Brand exact | 9 | User searched the brand by name. Active, specific intent. | Is competitor brand bidding inflating brand traffic with low-intent users? |
| Brand broad | 7 | Brand intent but query may be loose. Some noise. | Check search term reports — what queries are actually matching |
| Generic / exact match | 7 | Problem-aware, actively comparing solutions. High purchase intent. | Landing page match to query — mismatch kills intent |
| Generic / phrase match | 6 | Similar to exact but slightly broader audience. | Same as above — check search terms |
| Generic / broad match | 4 | Can match loosely related queries. Intent is uncertain. | High wasted spend risk. CVR will reveal quality. |
| Competitor terms | 5 | User was looking for someone else. Evaluating alternatives. | Expect lower CVR than brand — validate |
| RLSA (remarketing lists) | 7 | Has visited site before. Higher familiarity than cold CPC. | Confirm list definition — site visitor or specific page visitor? |

**Campaign and ad group level analysis:**
For Google CPC clients, go deeper than source/medium. Pull campaign → ad group → keyword data and score each cluster separately. A "generic/exact" campaign containing "football birthday party London" is different from one containing "kids party ideas". The former is high intent; the latter is inspiration browsing. Keyword-level CVR will show this.

### Paid Social

| Audience type | User type | Score | Why |
|---|---|---|---|
| Prospecting — cold | New | 2 | Interrupted. No active intent. Discovery mode. |
| Prospecting — cold | Returning | 4 | Has seen brand before but arrived via prospecting again. Some familiarity. |
| Broad / interest targeting | New | 3 | Slightly warmer than pure cold but still low intent. |
| Lookalike (1–5%) | New | 3 | Demographically similar to converters. Intent still unproven. |
| Retargeting — site visitor | New/Returning | 5 | Has been to the site. Has some product knowledge. |
| Retargeting — product page visitor | Returning | 6 | Viewed specific product. Intent signal is meaningful. |
| Retargeting — add to cart / form start | Returning | 8 | Started the conversion journey. High intent — just needs a nudge. |
| Customer list — lapsed | Returning | 7 | Has purchased before. Re-engagement campaign. |

**The paid social CVR reality:**
Prospecting CVR will almost always be lower than search. This is not a page problem — it is an intent gap. Cold paid social traffic is in discovery mode. The correct metric for prospecting is product explore rate and 7-day return rate, not booking CVR (see Tier 1 in this file). Do not benchmark paid social prospecting against organic search CVR. They are different jobs.

### Email

Email is the highest-intent channel on average — but email intent is **content-specific**, not channel-specific. A transactional email (booking confirmation, abandoned cart) carries different intent from a promotional email ("20% off this weekend") which carries different intent from a newsletter ("5 tips for kids birthday parties").

**Pre-conception scores by email type:**

| Email type | Score | Why | Testing consideration |
|---|---|---|---|
| Abandoned cart / booking | 9 | User was mid-transaction. Highest intent possible. | Very small audience — pool results carefully |
| Promotional / offer | 8 | User clicked a specific offer. High purchase intent. | Offer sensitivity — tests on this audience are offer-sensitive not page-sensitive |
| Re-engagement / win-back | 6 | Lapsed user responding to outreach. Medium intent. | Separate from active subscribers in analysis |
| Newsletter / content | 5 | Clicked from content, not a CTA. Interest, not intent. | Low CVR expected — measure engagement, not conversion |
| Triggered / behavioural | 7 | Fired by user action (viewed page, browsed product). Some intent signal. | Check trigger definition — what action fired it? |
| Welcome series | 5 | New subscriber. Curious but not necessarily in-market. | Early funnel — measure sign-up engagement not purchase |

**Why email needs separate treatment in testing:**

Email audiences are self-selected and primed by the email content before they arrive on site. A/B testing on email traffic conflates the email's effect with the page's effect. Rules:

1. **Never pool email and non-email traffic in the same test variant** — email traffic will skew results because it arrives pre-primed
2. **If testing a page that email drives significant traffic to** — either exclude email traffic from the test, or run a separate analysis cut for email vs non-email after the test concludes
3. **Email-specific tests** (subject line, send time, CTA copy in the email itself) are separate from page tests and should be run as email A/B tests, not VWO tests
4. **The UTM is your friend** — ensure every email link carries `utm_content` identifying the email type. This is how you distinguish newsletter clicks from promotional clicks in GA4.

### Organic Search

Organic intent is **landing page dependent**, not source dependent. The same `organic / google` source/medium can represent completely different intent levels depending on what query triggered it and what page it landed on.

**Framework for scoring organic segments:**

| Landing page type | Likely query intent | Score | Example |
|---|---|---|---|
| Product / service page | Transactional ("book X", "buy X", "X near me") | 7 | `/football-birthday-party` |
| Category / listing page | Commercial ("best X", "X options", "X comparison") | 6 | `/birthday-parties` |
| Location page | Local transactional ("X in London") | 7 | `/venues/manchester` |
| Blog / content page | Informational ("how to X", "ideas for X") | 3 | `/blog/birthday-party-ideas` |
| Homepage | Branded or generic navigational | 6 | `/` |
| FAQ / help page | Informational, support | 4 | `/faq` |

**Practical approach:**
In GA4, segment organic traffic by landing page before scoring intent. Organic traffic to `/football-birthday-party` is high intent. Organic traffic to `/blog/football-party-ideas` is low intent. They arrive under the same source/medium but they are completely different audiences. Report them separately.

### Direct / (none)

| Pattern | Score | Likely explanation |
|---|---|---|
| Direct to homepage | 7 | Bookmarked or memorised URL. Brand familiarity. |
| Direct to product/booking page | 9 | Returning user going directly to transact. |
| High direct % on new users | 3 | Likely attribution failure — UTMs dropped in redirect or email links untagged |

**Attribution health check:**
If direct / (none) accounts for more than 15% of sessions and a significant portion are "new users", this is almost certainly an attribution problem — UTM parameters being stripped in redirects, untagged email links, or cross-domain session breaks. Flag in the data confidence assessment. Do not score these sessions as high-intent. Investigate source before treating as a real segment.

---

APPEND after the intent scoring section:

## Validating Pre-Conceptions on Onboarding

The table above represents universal starting assumptions. They are hypotheses — not facts. Every assumption should be validated against the client's real CVR data during onboarding.

### The validation process

For each traffic segment in the table, calculate:
- **Observed CVR** — actual conversions / sessions for this segment over the last 90 days
- **Expected CVR** — what the pre-conception score predicts (broadly: score 8–10 = 4%+, score 6–7 = 2–4%, score 4–5 = 1–2%, score 2–3 = 0.5–1%, score 1–2 = <0.5%)
- **Variance** — is observed significantly higher or lower than expected?

### What variance tells you

**Observed >> Expected (significantly higher CVR than score predicts):**
The segment is converting better than the universal assumption. Reasons might include: strong brand loyalty in this audience, excellent landing page match for this source, or the client's product has unusually strong appeal to this segment. Upgrade the score for this client.

**Observed << Expected (significantly lower CVR than score predicts):**
Something is suppressing conversion for this segment specifically. Reasons might include: landing page mismatch, audience quality issue (e.g. broad match pulling irrelevant queries), or a trust/familiarity problem specific to this client. Downgrade the score and investigate root cause.

**Observed ≈ Expected:**
Pre-conception holds. Use the standard score.

### Recalibration format

Document any recalibrated scores in the client's `scoring.md`:

```
## Intent score recalibrations
# Updated from universal table based on 90-day CVR analysis

google_cpc_brand:
  universal_score: 9
  observed_cvr: 1.2%   # much lower than expected
  recalibrated_score: 6
  reason: Competitor brand bidding inflating brand campaign. 
          Search term report shows 40% of clicks are competitor queries.
          Action: add competitor terms as negatives, re-analyse.

email_newsletter:
  universal_score: 5
  observed_cvr: 4.8%   # much higher than expected
  recalibrated_score: 8
  reason: Newsletter is product-focused, not content-focused. 
          Strong correlation between newsletter send dates and booking spikes.
```

### When to skip validation

If the client has fewer than 500 sessions in a segment over 90 days, the CVR estimate is unreliable. Use the universal pre-conception score and flag it as unvalidated. Revisit once you have more data.

### Updating the onboarding report

Section 5 of the onboarding report ("Priority questions to answer in week 1") should always include:

> "Validate intent score pre-conceptions against 90-day CVR by source/medium segment. Flag any segments where observed CVR deviates >50% from expected. Document recalibrations in scoring.md."

## Implementation Order in VWO

Build personalisation campaigns in this order — highest value first:

**Phase 1 (immediate):**
1. Tier 5 — Returning + email/direct: fast path experience, location surfaced early
2. Tier 1 — Cold Meta mobile: redirect to dedicated landing page (stops the biggest CVR distortion)

**Phase 2 (after Phase 1 learning):**
3. Tier 4 — New desktop high intent: A/B test trust signals and package presentation
4. Tier 3 — New mobile organic/paid: dual CTA test (book now + email me)

**Phase 3 (after email capture infrastructure in place):**
5. Tier 2 — Retargeted social: nurture experience with email capture as primary CTA
6. Full sequence test: measure Tier 1 and 2 email captures through to 30-day booking rate

---

## Measuring the Full Programme

Once all tiers have personalised experiences, the reporting changes:

| Tier | Report metric | Do not report |
|---|---|---|
| 5 — Returning high intent | Booking CVR, checkout start rate | Email capture rate (irrelevant for this tier) |
| 4 — New high intent desktop | Package selection rate, booking CVR | Raw bounce rate (misleading for research sessions) |
| 3 — New medium mobile | Bookings + email captures combined, downstream email CVR | Booking CVR in isolation |
| 2 — Retargeted social | Email capture rate, 7-day return rate | Booking CVR (wrong metric for this tier) |
| 1 — Cold Meta mobile | Email capture rate, 30-day downstream booking CVR | Booking CVR on landing page (completely wrong metric) |

**The blended CVR number is no longer meaningful once personalisation is live.** Each tier is optimising for a different primary metric. Clients who ask "what is our CVR?" need to receive a tier breakdown, not a single number.

### Google / CPC

Match type is not directly available as a GA4 dimension. Intent must be inferred using a fallback hierarchy — work down from the most reliable signal to the least.

**Fallback hierarchy — use the first signal available:**

```
1. session_google_ads_query     → actual search query typed — most reliable
2. campaign name                → infer from naming convention
3. ad group name                → infer from naming convention
4. session_google_ads_keyword   → matched keyword (requires Ads link + auto-tagging)
5. Default score by campaign type assumption
```

**Level 1 — Actual search query (best)**

If Google Ads is linked to GA4 and auto-tagging is on, `session_google_ads_query` gives you the exact query the user typed. Classify by query intent directly:

| Query pattern | Score | Example |
|---|---|---|
| Brand name + transactional | 9 | "powerleague birthday party booking" |
| Brand name alone | 8 | "powerleague" |
| Product + location | 8 | "football birthday party London" |
| Product + transactional | 7 | "book football party for kids" |
| Generic product category | 6 | "kids football party" |
| Informational / how-to | 3 | "football party ideas for kids" |
| Competitor brand | 5 | "[competitor] birthday party" |

This is the most accurate scoring method. If you have query data, use it.

**Level 2 — Campaign name (common)**

Most agencies use naming conventions that encode campaign type. Common patterns:

| Campaign name pattern | Inferred type | Score |
|---|---|---|
| Contains `brand`, `branded`, `[B]`, `[BR]` | Brand | 8 |
| Contains `generic`, `non-brand`, `[NB]`, `[G]` | Generic | 6 |
| Contains `exact`, `[E]`, `[EX]` | Exact match | 7 |
| Contains `broad`, `[BM]`, `[BMM]` | Broad match | 4 |
| Contains `competitor`, `[COMP]` | Competitor | 5 |
| Contains `retargeting`, `RLSA`, `[R]` | Remarketing | 7 |
| Contains `shopping`, `PLA` | Shopping | 6 |
| Contains `dsa`, `DSA` | Dynamic Search | 5 |
| No recognisable pattern | Unknown | 5 (default) |

**On onboarding:** pull the campaign name list from GA4 → Acquisition → Traffic acquisition, filter to `google / cpc`, and document the naming convention in the client's `scoring.md`. If the client uses a consistent convention, Level 2 is reliable. If campaign names are freeform or inconsistently named, skip to Level 3.

**Level 3 — Ad group name**

`session_google_ads_ad_group_name` follows similar naming conventions. Apply the same pattern matching as Level 2. Ad group names are often more granular (e.g. `Brand - Exact | Football Parties` vs `Generic - Broad | Kids Activities`) so can give better signal than campaign name alone.

**Level 4 — Matched keyword**

`session_google_ads_keyword` gives the keyword that matched the query, not the query itself. Less useful than query but still provides signal. Apply the same query intent classification as Level 1 but with the caveat that broad match keywords can match very different queries.

**Level 5 — Default assumption (fallback)**

If none of the above signals are available or the naming convention is unusable:

| Situation | Default score | Note |
|---|---|---|
| Google Ads not linked to GA4 | 6 | Cannot distinguish brand vs generic. Flag as data gap. |
| Auto-tagging off, manual UTMs only | 5 | Only source/medium available. Segment by campaign if UTMs include campaign. |
| Campaign names unreadable | 5 | Flag in scoring.md — ask client or agency for naming convention doc |
| Shopping / PLA campaigns | 6 | Product intent is implied — user was shown a product and clicked it |

**Onboarding action — Google Ads audit:**

Add this to the onboarding checklist for any client running Google Ads:

```
[ ] Confirm Google Ads is linked to GA4 property
[ ] Confirm auto-tagging is enabled in Google Ads (not manual UTMs)
[ ] Pull campaign name list — document naming convention in scoring.md
[ ] Check if session_google_ads_query is populated in GA4
    → GA4 → Explore → Free form → add dimension "Session Google Ads query"
    → If populated: Level 1 scoring available
    → If empty: check Ads link and auto-tagging
[ ] Check ad group naming convention — document in scoring.md
[ ] Calculate CVR by campaign to validate pre-conception scores
```

**Document findings in clients/[client]/scoring.md:**

```
## Google Ads intent inference
ads_linked_to_ga4: true/false
auto_tagging: true/false
query_data_available: true/false
inference_level: 1/2/3/4/5
naming_convention: "[B] = brand, [G] = generic, [R] = RLSA"

## Campaign CVR validation
# Campaign name → inferred type → observed CVR → calibrated score
[B] Brand - Exact: brand, 4.2% CVR, score 9 (confirmed)
[G] Generic - Exact: generic_exact, 1.8% CVR, score 7 (confirmed)
[G] Generic - Broad: generic_broad, 0.6% CVR, score 4 (confirmed)
```

### Expected CVR benchmarks per tier (reference)

These are the denominators used in the intent-adjusted index calculation. Cross-reference with `brain/funnel-analysis.md Part 2D` for the full index methodology.

| Tier | Segment | Leisure | Lead gen | Ecommerce | SaaS |
|---|---|---|---|---|---|
| 1 | Cold social, new | 0.3% | 0.2% | 0.4% | 0.3% |
| 2 | Prospecting social, new | 0.5% | 0.4% | 0.6% | 0.5% |
| 3 | Generic paid, mobile | 0.9% | 0.7% | 1.0% | 0.8% |
| 4 | Generic paid, desktop | 1.6% | 1.2% | 1.8% | 1.5% |
| 5 | Organic / direct, new | 2.1% | 1.8% | 2.4% | 2.0% |
| 6 | Brand CPC / organic, new | 2.8% | 2.4% | 3.2% | 2.8% |
| 7 | RLSA / retargeting | 3.5% | 3.0% | 4.0% | 3.4% |
| 8 | Returning / direct | 4.4% | 3.8% | 5.0% | 4.2% |
| 9 | Returning email (promo) | 5.8% | 5.0% | 6.5% | 5.5% |
| 10 | Returning email (abandon) | 8.0% | 7.0% | 9.0% | 7.5% |

A segment with observed CVR below 80% of its tier benchmark is a CRO flag — not a traffic quality problem.
A segment with observed CVR below 60% of its tier benchmark is urgent — investigate with session recordings immediately.
