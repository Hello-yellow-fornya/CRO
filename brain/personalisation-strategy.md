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
## Implementation Order in VWO
Build personalisation campaigns in this order — highest value first:
**Phase 1 (immediate):**
1. Tier 5 — Returning + email/direct: fast path experience, location surfaced early
2. Tier 1 — Cold Meta mobile: implement discovery-mode product grid experience (maximum visibility, no gates, passive intent signal capture — stops the CVR distortion AND starts building retargeting audience quality)
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
| 1 — Cold Meta mobile | Product explore rate, scroll depth >50%, 7-day return rate, retargeting CVR on return visit | Booking CVR on cold session (wrong tier, wrong metric, wrong session) |
**The blended CVR number is no longer meaningful once personalisation is live.** Each tier is optimising for a different primary metric. Clients who ask "what is our CVR?" need to receive a tier breakdown, not a single number.
