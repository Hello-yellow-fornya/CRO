# Design Principles — The Complete UX & Visual Design Bible
**Scope:** Spacing, typography, colour, visual hierarchy, animation, layout, accessibility
**Last updated:** March 2026
**Sources:** Nielsen Norman Group, Material Design, Apple HIG, Baymard Institute, Unbounce, UXPin, IxDF, Cieden, DesignSystems.com
This file governs all mockup generation. Every HTML variation and control must reference these principles. When generating mockups, Claude must apply these rules systematically — not by instinct.
---
## 1. The Spacing System — 8pt Grid
### The Core Rule
Every spacing value — padding, margin, gap, height, width — must be a multiple of 8px. No exceptions.
```
Spacing scale:
4px   — micro (icon padding, tight text spacing only)
8px   — xs
16px  — sm
24px  — md
32px  — lg
40px  — xl
48px  — 2xl
64px  — 3xl
80px  — 4xl
96px  — 5xl
```
### Why 8?
- Divisible by 2, 4, and 8 — scales perfectly across retina displays (@2x, @3x)
- Matches how browsers render pixels — no sub-pixel blurriness
- Apple HIG and Google Material Design both mandate 8pt grids
- Creates predictable visual rhythm that users feel even if they don't consciously notice it
- Eliminates arbitrary decisions — 13px or 15px padding no longer exists
### The Internal ≤ External Rule (Gestalt)
Internal spacing (padding inside an element) must never be greater than external spacing (margin around the element). This ensures elements are perceived as distinct objects rather than blending together.
```
WRONG: button has 24px padding, but only 8px margin from adjacent element
RIGHT: button has 16px padding, with 24px margin from adjacent element
Rule: internal ≤ external spacing at all times
```
### Spacing Relationships
Think of elements as having a "friendship" with nearby elements:
| Relationship | Spacing | Example |
|---|---|---|
| Same component (internal) | 4–8px | Icon to label inside a button |
| Closely related elements | 8–16px | Label to input field |
| Related but separate | 16–24px | Button group spacing |
| Different sections | 32–48px | Form field to next form field |
| Major page sections | 64–96px | Hero to next section |
### Section Padding Rules
- Mobile sections: 40–48px top/bottom, 16–24px left/right
- Desktop sections: 64–96px top/bottom, container-constrained
- Container max-width: 1200px (most sites), 1440px (wide), 800px (editorial/blog)
- Content max-width for readability: 65–75 characters per line (approximately 600–750px)
### Button Sizing (8pt aligned)
| Size | Height | Horizontal padding | Use case |
|---|---|---|---|
| Small | 32px | 12px | Compact UI, table actions |
| Medium | 40px | 16px | Default — most CTAs |
| Large | 48px | 24px | Hero CTAs, primary actions |
| XL | 56px | 32px | Landing page hero only |
Minimum tap target on mobile: 44px height AND 44px width (Apple HIG minimum)
---
## 2. Typography System
### The Foundation
Start with body text at 16px. Everything else is derived from this. Never render font below 12px on any device.
```
Base: 16px body text
Line height body: 1.5 (= 24px) — multiply font size by 1.5
Line height headings: 1.1–1.2 for large headings, 1.3–1.4 for medium
Line heights should be divisible by 4 for grid alignment
```
### Type Scale (Major Third — 1.25x)
The most versatile scale for web. Provides clear hierarchy without excessive contrast.
```
Caption / label:  12px
Small:            14px
Body:             16px   ← start here
Large body:       18px
H4:               20px
H3:               24px
H2:               28–30px
H1:               36–40px
Display:          48–64px (hero headings only)
```
**For conversion-focused pages (CRO):** Use Major Third (1.25). For brand/editorial pages, Golden Ratio (1.618) creates more dramatic hierarchy but requires more whitespace to balance.
### Type Scale Ratios Explained
| Ratio | Value | Best for | Feel |
|---|---|---|---|
| Minor Third | 1.2 | Text-heavy, data-dense UI | Subtle, compact |
| Major Third | 1.25 | General web, most landing pages | Balanced |
| Perfect Fourth | 1.333 | Marketing, conversion pages | Clear, confident |
| Golden Ratio | 1.618 | Brand, editorial, luxury | Dramatic, spacious |
### Typographic Hierarchy Rules
1. Maximum 3 font sizes visible simultaneously on any screen
2. Maximum 2 typefaces per design (one for headings, one for body)
3. Maximum 3 font weights (e.g. 400, 600, 900)
4. Weight differentiation creates hierarchy without size change — bold subhead + regular body at same size works
5. ALL CAPS adds hierarchy — use sparingly (labels, category tags, small supporting text)
6. Letter spacing: normal for body, -0.5 to -2px for large headings (tighten large text), +0.5 to +2px for ALL CAPS labels
### Line Length (Measure)
The ideal line length for reading comprehension is 45–75 characters (about 600–750px at 16px). Beyond 75 characters, the eye struggles to track back to the next line. Below 45, constant line breaks break reading rhythm.
```css
.body-content {
  max-width: 65ch; /* ch = width of "0" character — 65ch ≈ 65 characters */
}
```
### Font Pairing Principles
- Contrast is the goal — pair a geometric sans-serif heading with a humanist sans-serif body
- Similar x-heights — ensures visual harmony when fonts sit near each other
- Avoid combining two display fonts or two decorative fonts
- Serif headings + sans-serif body = classic, trusted (news, finance, health)
- Sans-serif headings + sans-serif body = modern, clean (tech, SaaS, startup)
- Keep font loading to a maximum of 2 families and 3–4 weights for performance
### Letter Spacing Rules
```
Body text:        normal (0px) — never add letter spacing to body
Subheadings:      normal to -0.2px
H1/Display:       -0.5px to -2px (tighten for large text — optical correction)
ALL CAPS labels:  +0.5px to +2px (open up uppercase — improves legibility)
```
### Accessibility: Contrast Ratios (WCAG)
| Level | Contrast ratio | Use |
|---|---|---|
| AA Normal text | 4.5:1 minimum | Body text (mandatory) |
| AA Large text | 3:1 minimum | 18px+ or 14px bold |
| AAA Normal text | 7:1 | Optimal accessibility |
| Non-text elements | 3:1 | Buttons, icons, form borders |
Check: accessible-colors.com or WebAIM Contrast Checker
---
## 3. Colour System
### The 60-30-10 Rule
Every design uses colour in three proportions:
- **60%** — dominant/background colour (usually white, light grey or brand dark)
- **30%** — secondary colour (cards, sections, supporting elements)
- **10%** — accent colour (CTAs, highlights, key interactions)
This is why single-colour CTAs on neutral pages work: the accent colour commands attention precisely because it's used sparingly.
### Colour Roles in UI
| Role | Purpose | Rule |
|---|---|---|
| Primary / Brand | Main actions, links, key elements | Used sparingly — maximum impact |
| Neutral / Background | Page bg, card bg, section fills | Most of the page |
| Surface | Cards, modals, elevated content | Slightly offset from background |
| Success | Confirmations, completion, positive | Green family — never for primary action |
| Warning | Alerts, non-critical issues | Amber/yellow — use carefully |
| Danger / Error | Destructive actions, errors | Red family — sparingly |
| Text Primary | Main content | High contrast — always test ratio |
| Text Secondary | Supporting text, labels | Lower contrast than primary |
| Text Disabled | Inactive states | Should not meet WCAG AA — by design |
### Colour Psychology (applied to CRO)
| Colour | Psychological effect | CRO application |
|---|---|---|
| Green | Trust, go, positive, nature | Primary CTAs (financial, health, activity) |
| Blue | Trust, authority, calm, professional | Financial services, healthcare, B2B SaaS |
| Orange | Energy, urgency, warmth, affordable | Urgency banners, promotional CTAs |
| Red | Urgency, danger, passion, stop | Use cautiously — can reduce trust; works for sale banners |
| Black | Premium, exclusive, authority | Luxury, fashion, high-end products |
| White | Clean, simple, premium, space | Backgrounds, breathing room |
| Yellow | Optimism, attention, warmth | Highlights, note callouts (not primary CTAs) |
| Purple | Creative, innovative, wisdom | Tech, wellness, creative tools |
### The CTA Colour Rule
The CTA colour must appear nowhere else on the page except CTAs. The moment it appears on a non-interactive element, its power to signal "click here" is diluted.
### Colour and Accessibility
- Never convey meaning through colour alone — always pair with icon, label or pattern
- Colour blindness affects ~8% of males — red/green combinations are the most common issue
- Dark mode: always test your palette in both light and dark contexts
- Avoid pure black (#000000) for body text — use near-black (#1a1a1a or #212121) for less visual harshness
---
## 4. Visual Hierarchy
### The 7 Hierarchy Tools
In order of impact:
1. **Size** — larger = more important. Non-negotiable. Nothing else works without this foundation
2. **Colour & Contrast** — high contrast elements advance, low contrast recede
3. **Weight** — bold text signals importance without changing size
4. **Placement** — top-left gets seen first (F-pattern); above fold commands most attention
5. **Whitespace** — more space around an element = more important. Isolation creates attention
6. **Alignment** — consistent alignment creates order; strategic misalignment breaks pattern and draws eye
7. **Repetition** — repeated colour, shape or style creates expectation; breaks in repetition signal importance
### The F-Pattern and Z-Pattern
Eye tracking research shows consistent scanning patterns:
**F-Pattern** (text-heavy pages):
- Users read the full first line horizontally
- Then a shorter horizontal sweep below
- Then scan vertically down the left edge
- Place: headline, key trust signal, CTA, in that left-to-right priority
**Z-Pattern** (visual/landing pages):
- Top-left → top-right (logo to CTA)
- Diagonal sweep to bottom-left
- Bottom-left → bottom-right (secondary CTA)
- Use for landing pages and conversion pages
**Practical application for mockups:**
- Hero headline top-left or centred
- Primary CTA at natural F/Z endpoint
- Trust signals along the top bar (horizontal sweep)
- Never put important content in the middle-right on desktop — users rarely get there
### Visual Weight Rules
Elements with more visual weight naturally attract attention first. Weight is determined by:
- Larger size = more weight
- Higher contrast = more weight
- Saturated/warm colour = more weight than muted/cool
- Images with faces = extreme weight (humans are hardwired to look at faces)
- Movement/animation = highest weight of all (use last, use sparingly)
### 3-Second Rule
Users form their opinion of a design in 50 milliseconds. They decide whether to stay in 3 seconds. The hierarchy must communicate:
1. What this is (primary headline)
2. Why they should care (value proposition)
3. What to do next (CTA)
All three must be visible without scrolling on both desktop and mobile.
---
## 5. Whitespace (Negative Space)
### Whitespace Is Active, Not Passive
Jan Tschichold: "White space is to be regarded as an active element, not a passive background."
Whitespace performs three conversion-critical functions:
1. **Directs attention** — a CTA surrounded by whitespace commands more attention than one surrounded by other elements
2. **Reduces cognitive load** — fewer things competing = easier decision-making
3. **Signals quality and trust** — Apple, luxury brands, and high-trust organisations use generous whitespace as a brand signal
### Proven Conversion Impact
From UXPin case studies:
- Removing content surrounding a CTA button **always** improves its conversion rate
- Xerox reduced content around Add to Cart buttons → 20% engagement improvement, 5% more adds to cart, 33% improvement in purchase continuation
- Apple uses whitespace to achieve 81% attention on main message — 2x higher than Samsung, 4x higher than Huawei
### Whitespace Rules for Mockups
1. **Isolate the primary CTA** — nothing should sit within 32px of the primary CTA button except its own label and possibly a micro-trust signal (e.g. "Free, no credit card")
2. **Section breathing room** — minimum 64px above and below major content sections
3. **Paragraph spacing** — 1em (16px) between paragraphs minimum
4. **Around images** — images need breathing room to feel premium; don't let text crowd images
5. **The hero rule** — hero sections almost always benefit from more whitespace than feels comfortable
---
## 6. Animation and Motion
### The Cardinal Rules
1. **Every animation must have a purpose** — feedback, orientation, state change, personality. No decorative motion.
2. **Never use linear easing** — linear motion feels robotic. Always use ease-in, ease-out, or custom curves.
3. **Faster is almost always better** — users are waiting. Get out of their way.
4. **Respect prefers-reduced-motion** — always include this CSS media query. Non-negotiable.
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
### Animation Duration Reference (from NN/G and production research)
| Interaction | Duration | Easing | Why |
|---|---|---|---|
| Hover state | 100–150ms | ease-out | Near-instant feedback |
| Button press/active | 100ms | ease-out | Immediate tactile feel |
| Focus ring appear | 100ms | ease-out | Instant accessibility signal |
| Toggle/switch | 150–200ms | spring or cubic-bezier(0.34, 1.56, 0.64, 1) | Slight overshoot = physical feel |
| Checkbox | 150ms | ease-out | Snappy confirmation |
| Tooltip show | 150ms | ease-out | Fast enough to not feel delayed |
| Tooltip hide | 100ms | ease-in | Faster exit than entrance |
| Dropdown open | 200ms | ease-out | Visible but not slow |
| Modal open | 200–250ms | ease-out | Needs to feel intentional |
| Modal close | 150–200ms | ease-in | Faster exit |
| Page section reveal | 300–400ms | ease-out | Staggered reveals feel rich |
| Success animation | 400–600ms | ease-out | Celebration deserves a moment |
| Loading spinner | Continuous | linear | The only legitimate linear use |
**Rule:** If unsure, go shorter. Animations over 500ms feel slow to users except for deliberate celebration moments.
### Easing Types Explained
```
ease-out: fast start → slow end
  Use for: elements ENTERING view, modals opening, dropdowns
  Feel: natural arrival, object coming to rest
ease-in: slow start → fast end
  Use for: elements LEAVING view, modals closing, dismissals
  Feel: gravity pulling away, acceleration into exit
ease-in-out: slow → fast → slow
  Use for: elements MOVING across screen, scroll-triggered transitions
  Feel: deliberate, balanced
linear: constant speed
  Use for: spinners, progress bars ONLY
  Feel: robotic/mechanical — avoid for any interaction
spring/elastic: overshoot then settle
  Use for: toggles, bouncy confirmations, playful UI
  cubic-bezier(0.34, 1.56, 0.64, 1): the standard spring
  Feel: physical, alive, personality
```
### What to Animate (and What Not To)
**High performance (only these — no layout changes):**
```css
transform: translateX/Y/Z, scale, rotate  /* GPU accelerated */
opacity                                     /* GPU accelerated */
```
**Expensive — avoid animating:**
```css
width, height, padding, margin, top, left  /* triggers layout recalculation */
background-color (in some cases)           /* triggers repaint */
box-shadow (complex)                       /* repaint */
```
**Practical button state example:**
```css
.btn {
  transition: transform 100ms ease-out, box-shadow 100ms ease-out,
              background-color 150ms ease-out;
}
.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  background-color: [darker shade];
}
.btn:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```
### Micro-Interaction Taxonomy
| Type | Purpose | Duration | Example |
|---|---|---|---|
| Feedback | Confirm action was received | 100–200ms | Button press, form submit |
| Status | Communicate system state | Continuous | Loading spinner, progress bar |
| Orientation | Help user understand spatial relationships | 200–300ms | Modal origin, dropdown direction |
| Personality | Express brand character | 300–500ms | Success celebration, onboarding delight |
| Guidance | Direct attention to next action | Subtle, looping | Pulsing CTA, animated arrow |
### Stagger Animation (for section reveals)
When revealing multiple items simultaneously, stagger them:
```css
/* Items appear in sequence, creating a cascade feel */
.item:nth-child(1) { animation-delay: 0ms; }
.item:nth-child(2) { animation-delay: 60ms; }
.item:nth-child(3) { animation-delay: 120ms; }
.item:nth-child(4) { animation-delay: 180ms; }
```
Maximum stagger delay: 200ms per item. Beyond that, the last item feels abandoned.
---
## 7. Layout Principles
### Grid System
Use a 12-column grid for desktop. 4-column for mobile.
```
Desktop (1440px):
  Container: 1200px max-width
  Columns: 12
  Gutter: 24px
  Margin: auto (centred)
Tablet (768px):
  Columns: 8
  Gutter: 16px
  Margin: 24px
Mobile (375px):
  Columns: 4
  Gutter: 16px
  Margin: 16px
```
### Content Width Rules
| Content type | Max width | Why |
|---|---|---|
| Full-bleed hero | 100vw | Fills viewport |
| Hero content | 800px | Prevents too-wide headlines |
| Body text / editorial | 65ch (~650px) | Optimal reading line length |
| Forms | 480–560px | Single column, comfortable input width |
| Cards (3-up) | ~360px each | Cards at 33% grid |
| Navigation | container max-width | Aligns with page content |
### Above the Fold Rules
Above the fold must contain:
1. Clear headline — what this is
2. Clear value proposition — why it matters
3. Primary CTA — what to do
4. One trust signal — why to trust
Nothing else is required above the fold. Everything else is secondary.
### Z and F Pattern Implementation
For a conversion landing page, use Z-pattern:
```
[Logo/Nav]                    [Primary CTA]      ← Top horizontal
        ↘ diagonal attention flow ↙
[Value proposition]   [Hero image/social proof]  ← Bottom horizontal
```
### Responsive Breakpoints
```
Mobile:        375px–767px    → single column, 16px margins
Tablet:        768px–1023px   → 2 column where appropriate
Desktop:       1024px–1439px  → full layout
Wide desktop:  1440px+        → container stops growing
```
### Section Anatomy (for every content section)
Every section should have:
1. **Section label** — small, ALL CAPS, brand colour, above heading (optional but powerful)
2. **Heading** — primary message of the section
3. **Subheading/body** — supporting context (keep short — 2–3 lines)
4. **Content** — the thing itself (cards, features, testimonials, etc.)
5. **CTA** (optional but recommended for conversion sections)
---
## 8. Interactive States
Every interactive element must have all 5 states designed:
| State | Description | Design requirement |
|---|---|---|
| Default | Normal resting state | Full opacity, standard colour |
| Hover | Mouse/cursor over | Subtle elevation OR colour shift (not both at same intensity) |
| Focus | Keyboard navigation active | Visible focus ring — 2px solid, offset 2px, brand colour |
| Active/Pressed | Click/tap in progress | Scale 0.97–0.98, darker shade |
| Disabled | Not interactive | 40% opacity, cursor: not-allowed, no hover effect |
```css
/* Focus ring — critical for accessibility */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```
---
## 9. Forms
Forms are the highest-friction element in any conversion flow. Every design decision matters.
### Form Layout Rules
1. **Single column always** — multi-column forms are harder to complete on mobile and rarely save meaningful space
2. **Labels above fields** — never inside (placeholder text disappears on input, causes confusion)
3. **Field height: 44–48px** — minimum tap target on mobile, comfortable on desktop
4. **Field width matches expected input** — phone number field should be narrower than email field
5. **Error messages: red, below field, specific** — "Please enter a valid email address" not "Error"
6. **Inline validation** — show success/error as user types, not only on submit
### Form Field Spacing
```
Label to field: 8px
Field to field: 16–24px
Field to submit button: 24–32px
Submit button: full width on mobile, natural width on desktop
```
### Progress Indicators (multi-step forms)
- Show step count ("Step 2 of 3") AND visual progress bar
- Never show all steps at once — show only current step
- Back button available on every step
- Preserve data if user navigates back
---
## 10. Accessibility Foundations (WCAG 2.1)
These are minimum standards. Meeting them also improves conversion for everyone.
| Requirement | Standard | Test |
|---|---|---|
| Text contrast | 4.5:1 normal, 3:1 large | WebAIM Contrast Checker |
| Touch targets | 44px × 44px minimum | Measure in DevTools |
| Focus visible | 2px solid ring, visible | Tab through page |
| Alt text | All images | Screen reader test |
| Form labels | All inputs labelled | No placeholder-only labels |
| Error identification | Text, not colour only | Remove colour — is error still clear? |
| Skip navigation | Skip link at top | For keyboard users |
| Reduced motion | prefers-reduced-motion | Respect user OS setting |
---
## 11. Design Principles Applied to CRO Mockups
When generating a mockup, apply these in sequence:
**Step 1 — Establish hierarchy first**
Before any visual design, identify: what is the one thing users must see first? What is second? What is third? Only then apply visual design to reinforce that hierarchy.
**Step 2 — Apply the 8pt grid**
Every spacing value, margin, padding, height must be an 8pt multiple. No exceptions.
**Step 3 — Typography scale**
Set body at 16px. Derive all other sizes from a consistent scale. Never have more than 3 font sizes visible simultaneously.
**Step 4 — Colour budget**
Use 60-30-10 rule. The CTA colour appears on CTAs only. Trust signals inherit brand colour. Body text is near-black on white.
**Step 5 — Whitespace audit**
After placing all elements, add 20% more whitespace than feels comfortable. Then evaluate. Most designs are under-spaced. CTA needs the most breathing room.
**Step 6 — Animation**
Add only purposeful animations. Button hover, form validation feedback, section reveals. Duration under 300ms. Ease-out for entrances, ease-in for exits. Add prefers-reduced-motion.
**Step 7 — Mobile check**
Collapse to 375px. Does hierarchy survive? Is CTA accessible? Is font readable without zooming?
**Step 8 — Accessibility check**
Does every interactive element have a visible focus state? Do colours meet 4.5:1? Are touch targets ≥ 44px?
---
## 12. CRO-Specific Design Rules
These rules are derived from conversion research and should override aesthetic preferences:
| Design decision | CRO rule | Evidence |
|---|---|---|
| CTA button | Full-width on mobile, min 48px tall, high contrast, never grey | +12–20% form starts |
| Form labels | Above field, never inside (placeholder only) | Reduces errors, increases completion |
| Social proof | Near/above CTA, never at bottom | Needs to be at decision point |
| Navigation on landing pages | Remove it | +10–25% conversion |
| Hero image | Real people, authentic (not stock) | Increases trust and relevance |
| Whitespace around CTA | Minimum 32px clearance | Removes competition for attention |
| Text line length | Max 65–70ch | Maintains reading flow |
| Section contrast | Alternate background colours for visual separation | Prevents section blindness |
| Loading indicators | Always show within 300ms of action | Prevents "did it work?" anxiety |
| Error states | Inline, specific, non-blaming copy | Reduces form abandonment |
---
## 13. Top YouTube Channels for Ongoing Design Education
These are the most consistently valuable channels for design principles (not tool tutorials):
| Channel | Focus | Best for |
|---|---|---|
| Satori Graphics | Layout theory, typography, white space — the logic behind why design works | Visual hierarchy, type principles |
| The Futur | Business of design, brand strategy, typography — holistic perspective | Big picture thinking |
| AJ&Smart | Design sprints, facilitation, strategic layer of product design | Process and team alignment |
| DesignCourse (Gary Simon) | UI/UX fundamentals, critique, frontend implementation | Full-stack design thinking |
| Flux Academy | Web design, layout, Figma, responsive design, case studies | Practical web design |
| Malewicz | UI design, animation, visual refinement | Micro-detail quality |
| Jesse Showalter | UX process, research, stakeholder communication | Research-to-design workflow |
**Most valuable for CRO mockup quality:** Satori Graphics (hierarchy/layout) + DesignCourse (conversion-aware UI) + Flux Academy (web-specific best practices)
