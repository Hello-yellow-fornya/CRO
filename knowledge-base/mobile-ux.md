# Mobile UX Knowledge Base

**Sources:** VWO 5-Step Mobile App UX Action Plan; VWO DIY Guide to Improving Conversions
**Last updated:** March 2026

---

## The Mobile UX Business Case

| Stat | Implication |
|---|---|
| 77% of DAUs quit an app within the first 3 days | Onboarding is the highest-priority mobile CRO surface |
| 25% of users abandon after just one use | First session experience is make-or-break |
| 33.8% uninstall due to crashes and freezes | Performance is an acquisition problem, not just a UX one |
| Average app loses $33,000/month from uninstallations | Mobile UX has a direct, quantifiable revenue cost |

These figures apply directionally to mobile web as well as native apps. Users have zero patience on mobile — friction that would be tolerated on desktop causes abandonment on mobile.

---

## Mobile-Specific Friction Signals

These signals indicate UX problems before users explicitly complain. Track them proactively.

### Rage Taps
Rapid repeated tapping on an element — the mobile equivalent of rage clicking. Indicates:
- Element not responding fast enough (INP problem)
- User expects the element to be interactive but it isn't (dead click)
- Element too small to tap accurately (touch target below 44px)

**CRO action:** Session recordings filtered for rage tap events surface the highest-friction moments in mobile journeys. Run these before forming any mobile hypothesis.

### Dead Clicks / Dead Taps
Taps on non-interactive elements users assume are clickable. Common causes:
- Image banners that look like buttons (prominent visual but no link)
- Underlined or highlighted text that isn't a link
- Card layouts where only part of the card is tappable

**Case study from the ebook:** An eCommerce app's home screen had an image banner receiving high tap volume in heatmaps. Session recordings revealed it was non-interactive — tapping it did nothing. Users tapped repeatedly then abandoned. Fix: make the banner a link. Result: friction removed, abandonments reduced.

### App Crashes and Freezes
Crashes on specific screens are conversion killers. Check:
- Screen where crash occurs (checkout is highest-cost)
- User action that precedes crash (e.g. entering coupon code)
- Device/OS combinations with highest crash rates

**Case study from the ebook:** Travel booking app crashed when users entered coupon codes at checkout. Despite a separate (easier) filter option bug existing on search results, the checkout crash was the correct priority — it directly caused abandoned bookings.

### Scroll Depth Signals
Content below 50% scroll depth is effectively invisible on mobile. If a CTA is below the fold and scroll depth data shows most users don't reach it — the CTA placement is the hypothesis, not the CTA copy.

---

## The 5-Step Mobile UX Optimisation Framework

### Step 1 — Identify friction points
**What to use:**
- Mobile heatmaps — visualise where users tap on each screen
- Session recordings — watch actual user sessions to see the problem in context
- App store reviews — unsolicited user feedback on real pain points
- In-app surveys — direct feedback at the moment of experience
- Customer support emails — recurring themes signal systemic issues
- Analytics — exit rates, crash rates, drop-off points per screen

**Key principle:** Analytics tools tell you *where* the problem is (bounce rate, exit rate, crash count). Qualitative tools (heatmaps, recordings) tell you *what* the problem actually is. You need both.

### Step 2 — Prioritise using P.I.E.
Score each identified issue on three dimensions, 1–10:

| Dimension | Question | Weight |
|---|---|---|
| **P**otential | What improvement could this fix deliver? | 33% |
| **I**mportance | How much traffic / revenue flows through this screen? | 33% |
| **E**ase | How technically difficult is the fix? | 33% |

P.I.E. Score = (P + I + E) ÷ 3

**Real example from the ebook:**

| Priority | Issue | Potential | Importance | Ease | P.I.E. Score |
|---|---|---|---|---|---|
| 1 | Checkout screen crash | 8 | 9 | 7 | **8.0** |
| 2 | Product images (slow load) | 8 | 6 | 9 | **7.6** |
| 3 | Search & filter bug | 6 | 7 | 4 | **5.6** |

The checkout crash scores highest despite not being the easiest fix — because its Importance score is highest (checkout is the highest-revenue screen). Fix the most impactful issue first, not the easiest.

### Step 3 — Get stakeholder buy-in
Present findings with data, not opinions. Show:
- Heatmap screenshot of the problem
- Session recording clip showing the friction in action
- Revenue impact estimate (e.g. "X% of checkout sessions encounter this crash")

Data-backed presentations reduce resistance. Stakeholders can debate opinions; they cannot debate recordings.

### Step 4 — Build and test hypotheses
Convert observations into testable hypotheses using the standard format:
```
"I believe [change] will result in [outcome] because [reason from data]."
```

Run A/B tests to validate before full deployment. Never implement directly without testing — even obvious improvements can have unintended negative effects on other metrics.

**Mobile A/B testing best practices:**
- Define hypothesis and success metric before creating the variant
- Identify a single clear goal per test
- Segment audience appropriately (OS, device, user type)
- Test one variable at a time
- Run for adequate duration — minimum one full business cycle
- Use Bayesian statistics engine (see brain/cro-principles.md)

### Step 5 — Monitor post-change
Optimisation is a cycle, not a project. After deploying a winner:
- Continue tracking the same screen with heatmaps and recordings
- Look for new friction patterns introduced by the change
- Use the learnings to generate the next hypothesis
- Document everything — what was tested, what happened, what it means

---

## Mobile CRO Priority Screens

In order of typical conversion impact:

| Screen | Why it matters | Key signals to watch |
|---|---|---|
| Onboarding flow | 77% drop-off in first 3 days — this is where most users leave | Step completion rates, rage taps, exits per step |
| Checkout / payment | Highest revenue impact per friction point | Crash events, dead taps, form abandonment |
| Home screen / dashboard | Entry point — sets expectations | Dead clicks on non-interactive elements, scroll depth |
| CTA placement | Single biggest moveable conversion lever | Click rate by position, scroll depth to CTA |
| Navigation | Confusion here cascades to all other screens | Dead taps on nav elements, unexpected exits |
| Loading screens | Performance is experience | Load time by screen, rage taps during loading |

---

## Mobile-Specific Design Rules for Mockups

When generating mobile layouts:
- Minimum touch target: 44px × 44px (Apple HIG minimum)
- Primary CTA: full-width on mobile, min 48px height
- No hover-dependent interactions (mobile has no hover state)
- Thumb zone: primary actions in bottom 40% of screen (within natural thumb reach)
- Font minimum: 16px body text — smaller causes mobile Safari to auto-zoom forms
- Line length: 35–45 characters on mobile (narrower than desktop's 65ch)
- Tap spacing: minimum 8px between adjacent tap targets

---

## Mobile Qualitative Analysis Workflow

For any mobile hypothesis, run this sequence before writing the hypothesis:

1. **Heatmap review** — which elements are getting unexpected tap patterns?
2. **Session recording filter** — filter for rage taps on the screen in question
3. **Scroll depth check** — what percentage of users reach the primary CTA?
4. **Exit/crash event review** — which user actions precede exits or crashes?
5. **App store review scan** — recurring complaints that match observed patterns?

Only after completing this sequence is there enough evidence to write a strong hypothesis.
