# Client Context File — Powerleague

**Client:** Powerleague
**Website:** powerleague.com
**Country:** UK and Ireland
**Last updated:** March 2026
**Vertical:** Leisure & Sports / Activity Booking

## 1. Business Context

Powerleague operates 300+ football venues across the UK and Ireland. Kids parties product is a structured packaged birthday party experience — 2 hours, coached, includes food and keepsakes.

### Primary Conversion Goals

| Goal | Page | Metric |
|---|---|---|
| Kids party booking | /football-birthday-party | Booking started and completed |
| Pitch booking | /booking/find-location | Session booked |
| League sign-up | /5-a-side-leagues-near-me | League application submitted |
| Holiday camp booking | /football-holiday-camps | Booking completed |

### Key Business Facts

- 93% of parents recommend them — strong social proof asset, currently underused
- 300+ venues including partner venues
- Packages: Pitch and Play £9.95/child, Silver Strike £18.50/child, Golden Boot £28.50/child
- Minimum 10 children per party
- Split payment functionality exists — undersurfaced in UX
- Coach accreditation is a key trust signal
- Brand partnerships: Nike, Chicago Town pizza, Happy Monkey, Match Attax, Costa, Lucozade
- Dublin Spawell uses EUR not GBP

## 2. Tech Stack

| Layer | Technology | Confidence |
|---|---|---|
| CMS | WordPress | High |
| Theme | Custom Pegasus theme | High |
| Analytics | Google Analytics 4 | Confirmed |
| A/B Testing | VWO | Confirmed, fully implemented |
| Booking engine | Custom proprietary | High |

## 3. Design System

NOTE: CSS token extraction required from DevTools before generating mockups.
Open Chrome DevTools on powerleague.com/football-birthday-party and extract:
- H1 font-family, font-weight, font-size, letter-spacing, text-transform
- Body paragraph font-family, font-size
- CTA button background-color, border-radius, padding
- Section padding values
- Any :root CSS variables

### Colours confirmed from visual inspection

| Token | Hex | Usage |
|---|---|---|
| Primary green | #00A651 | CTAs, accents, logo |
| Dark navy | approx #0D1B2A | Nav, dark sections |
| White | #FFFFFF | Content sections |

### Typography confirmed visually

- Headings are ALL CAPS, heavy weight
- Section labels use small ALL CAPS above main heading
- CTA buttons are ALL CAPS
- All precise font values need DevTools extraction

## 4. Funnel Map

Entry points: Organic search, direct, paid, internal nav Kids > Kids Parties

/football-birthday-party
→ Package selection on-page
→ /booking/select-location
→ /booking/select-package
→ /checkout/basket
→ Confirmation

### Known friction points

1. Location not surfaced until after package selection — likely major drop-off
2. Two competing hero CTAs with no clear hierarchy
3. BOOK PARTY buttons load asynchronously — Loading state visible
4. 93% recommendation stat buried below fold
5. Package feature lists are exhaustive — high cognitive load
6. No urgency signals on landing page
7. Split payment only visible at checkout

## 5. Analytics Setup

GA4 confirmed active. Key events per test:
- begin_checkout — booking flow started
- package_selected — which package clicked
- location_selected — venue confirmed
- purchase — booking completed

VWO confirmed active and fully implemented.

## 6. Test History

| Test ID | Page | Hypothesis | Result | Uplift | Date |
|---|---|---|---|---|---|
| PL-001 | TBD | TBD | — | — | — |

## 7. Off-Limits

| Element | Constraint |
|---|---|
| Package pricing | Do not test without client approval |
| Coach accreditation claims | Must remain factually accurate |
| Brand partner logos | Cannot be removed — partnership agreements |
| Dublin pricing | Must show EUR for IE traffic |
| Minimum 10 children rule | Must remain clearly communicated |
