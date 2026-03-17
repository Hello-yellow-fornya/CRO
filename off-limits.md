# Client Context File — Powerleague

**Client:** Powerleague  
**Website:** powerleague.com  
**Country:** UK & Ireland (+ Netherlands expansion)  
**Last updated:** March 2026  
**Vertical:** Leisure & Sports / Activity Booking  
**Sub-verticals:** Kids parties, holiday camps, 5-a-side leagues, pitch booking, corporate events, padel  

---

## 1. Business Context

### What They Do
Powerleague operates 300+ football venues across the UK and Ireland. Their kids parties product is a structured, packaged birthday party experience (2 hours, coached, includes food and keepsakes). They also run adult leagues, holiday camps, padel, and corporate events.

### Primary Conversion Goals
| Goal | Page | Metric |
|---|---|---|
| Kids party booking | /football-birthday-party | Booking started → completed |
| Pitch booking | /booking/find-location | Session booked |
| League sign-up | /5-a-side-leagues-near-me | League application submitted |
| Holiday camp booking | /football-holiday-camps | Booking completed |

### Key Business Facts (CRO-relevant)
- 93% of parents recommend them (strong social proof asset — underused)
- 300+ venues including 300+ partner venues beyond owned sites
- Packages: Pitch & Play (£9.95/child), Silver Strike (£18.50/child), Golden Boot (£28.50/child)
- Minimum 10 children per party
- Split payment functionality exists — currently undersurfaced in UX
- Coach accreditation is a key trust signal
- Brand partnerships: Nike, Chicago Town pizza, Happy Monkey, Match Attax (Topps), Costa, Lucozade
- Dublin Spawell has different pricing (€ not £) — worth noting for geo-targeting tests

---

## 2. Tech Stack

| Layer | Technology | Confidence | Notes |
|---|---|---|---|
| CMS | WordPress | High | `/wp-content/` paths throughout |
| Theme | Custom "Pegasus" theme | High | `/themes/pegasus/` in asset paths |
| Frontend framework | Custom JS (no React detected) | High | Standard WordPress JS patterns |
| CSS architecture | Custom CSS, likely BEM or utility | Medium | Needs DevTools confirmation |
| Hosting | Unknown (likely WP Engine or similar) | Low | — |
| Analytics | Google Analytics 4 | Confirmed | Client confirmed |
| A/B Testing | VWO | Confirmed | Client confirmed, fully implemented |
| Booking engine | Custom / proprietary | High | `/booking/` routes suggest custom system |
| Image delivery | WordPress media library | High | `/wp-content/uploads/` |
| CDN | Unknown | — | Needs confirmation |

---

## 3. Design System

> ⚠️ INCOMPLETE — CSS token extraction required from DevTools before generating any mockups
> See Section 3.5 for extraction instructions

### 3.1 Colours (confirmed from visual inspection)

| Token | Hex | Usage |
|---|---|---|
| Primary green | #00A651 | CTAs, accents, logo background |
| Dark navy | #0D1B2A (approx) | Nav background, dark sections |
| White | #FFFFFF | Content sections, cards |
| Light grey | #F4F4F4 (approx) | Alternate section backgrounds |
| **NEEDS CONFIRMATION** | | |
| Secondary green (mid) | ❓ | Hover states, borders |
| Text primary | ❓ | Body copy colour |
| Text secondary | ❓ | Subheadings, labels |
| Warning/accent | ❓ | Badges, highlights |

### 3.2 Typography

> ⚠️ NEEDS DEVTOOLS EXTRACTION — paste from Computed Styles panel

| Element | Font family | Weight | Size | Transform | Notes |
|---|---|---|---|---|---|
| H1 (hero) | ❓ | ❓ | ❓ | UPPERCASE confirmed visually | "HOST YOUR FOOTBALL PARTY" |
| H2 (section heads) | ❓ | ❓ | ❓ | UPPERCASE confirmed visually | |
| H3 (sub-heads) | ❓ | ❓ | ❓ | Title case | |
| Body copy | ❓ | ❓ | ❓ | Normal | |
| CTA buttons | ❓ | ❓ | ❓ | UPPERCASE confirmed visually | |
| Nav links | ❓ | ❓ | ❓ | Title case | |

**Confirmed visual patterns:**
- Headings are ALL CAPS, heavy weight, condensed feel
- Section headings use a clear hierarchy with coloured sub-labels (e.g. "NEW KIDS PARTY PACKAGES FOR 2026")
- Body copy is clean and readable, appears to be a standard sans-serif
- Buttons are ALL CAPS with no border radius visible (or very small)

### 3.3 Components

> ⚠️ NEEDS DEVTOOLS EXTRACTION for precise values

| Component | Border radius | Padding | Notes |
|---|---|---|---|
| Primary CTA button | ❓ | ❓ | Green bg, white text, ALL CAPS |
| Secondary CTA button | ❓ | ❓ | Dark bg or outline |
| Package cards | ❓ | ❓ | White cards with border |
| Hero section | ❓ | ❓ | Full-width, dark bg, image overlay |
| Content sections | ❓ | ❓ | Alternating white / light grey |
| FAQ accordion | ❓ | ❓ | Expandable items |
| Nav | ❓ | ❓ | Dark bg, logo left, links right |

### 3.4 Layout Patterns (confirmed visually)

- Full-width hero with dark overlay on background image
- Alternating white / grey content sections
- 3-column package card grid (desktop)
- Centred content with max-width container
- Mobile: single column stacking
- Green CTA buttons used throughout — consistent
- Section labels in small ALL CAPS above main heading (e.g. "OUR PROCESS")
- Icon + text feature lists (emoji icons currently used on site)

### 3.5 DevTools Extraction Guide

To complete this context file, open Chrome DevTools on powerleague.com/football-birthday-party and extract:

**Fonts:**
- Right-click H1 text → Inspect → Computed → `font-family`, `font-weight`, `font-size`, `letter-spacing`, `text-transform`
- Repeat for body paragraph text and CTA button text

**Colours:**
- Click `<html>` element in Elements panel → look for `:root` CSS variables in Styles
- If no variables: inspect green CTA button for `background-color`, dark nav for `background-color`
- Inspect body text for `color` value

**Spacing & Radius:**
- Inspect a CTA button: `padding`, `border-radius`
- Inspect a content section: `padding-top`, `padding-bottom`
- Inspect a package card: `border-radius`, `box-shadow`, `padding`

**CSS class naming conventions:**
- Note any class names on key components (e.g. `.btn`, `.btn-primary`, `.package-card`)
- This tells us their naming convention for VWO code selectors

---

## 4. Funnel Map

```
Entry points:
  - Organic search (birthday party keywords)
  - Direct / brand
  - Paid (assumed)
  - Internal nav (Kids > Kids Parties)

Landing page: /football-birthday-party
  ↓
Package selection (on-page scroll)
  ↓
Location selection: /booking/select-location?search_package_type=Kids+party+package
  ↓
Booking flow: /booking/select-package
  ↓
Checkout: /checkout/basket
  ↓
Confirmation
```

**Known friction points (from page inspection):**
1. Location not surfaced until AFTER package selection — likely major drop-off
2. Two competing hero CTAs (different packages) with no clear hierarchy
3. "BOOK PARTY" buttons load asynchronously — "Loading..." state visible
4. 93% recommendation stat buried below fold
5. Package feature lists are exhaustive — high cognitive load
6. No urgency signals on landing page
7. Split payment option only visible at checkout

---

## 5. Analytics & Testing Setup

### GA4
- Status: Confirmed active
- Key events to track per test:
  - `begin_checkout` — booking flow started
  - `package_selected` — which package clicked
  - `location_selected` — venue confirmed
  - `purchase` — booking completed
- Segments to create pre-test:
  - Mobile vs desktop
  - New vs returning
  - Geo: UK regions (for city page tests)

### VWO
- Status: Confirmed active, fully implemented
- Implementation type: Unknown (JavaScript snippet vs tag manager) — needs confirmation
- Anti-flicker: Unknown — confirm before first test to avoid flicker issues
- Custom goals to set per test: see above GA4 events

---

## 6. Test History

| Test ID | Page | Hypothesis | Type | Result | Uplift | Date |
|---|---|---|---|---|---|---|
| PL-001 | TBD | TBD | TBD | — | — | — |

*Populate after first test launches*

---

## 7. Off-Limits & Constraints

| Element | Constraint | Reason |
|---|---|---|
| Package pricing | Do not test — confirm with client first | Commercial sensitivity |
| Accreditation claims | Must remain factually accurate | Regulatory |
| Brand partner logos | Cannot be removed | Partnership agreements |
| Dublin pricing (€) | Separate from UK (£) — do not mix | Geographic |
| Minimum 10 children rule | Cannot be removed from comms | Operational |
| ❓ Add more | Confirm with client | — |

---

## 8. Client Scoring Config

| Parameter | Value | Notes |
|---|---|---|
| Conversion weighting | All packages equal for now | Revisit if data shows Golden Boot = higher LTV |
| Max test duration | Calculate per test based on traffic | Traffic-dependent |
| MDE baseline | 10% minimum detectable effect | Standard starting point |
| Significance threshold | 95% | Industry standard |
| Priority goal Q1/Q2 2026 | Kids party bookings | Confirm with client |
| Seasonal blackout | Late August, late December | Low traffic, distorted data |
