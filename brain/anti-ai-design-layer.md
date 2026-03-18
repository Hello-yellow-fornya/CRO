# Anti-AI Design Layer

**Purpose:** Prevent generic AI-generated aesthetics in all mockup output
**Status:** MANDATORY — referenced in every mockup generation prompt
**Last updated:** March 2026

---

## The Problem: Why AI Designs Look Like AI

LLMs are statistical pattern matchers. When asked to generate a design without specific constraints, Claude produces the median of every Tailwind CSS tutorial, Dribbble screenshot and GitHub repo it was trained on — which converges heavily on designs from 2020–2022.

The result is instantly recognisable as AI-generated. It does not look like a real client's website. It looks like every other AI-generated website.

---

## The Complete AI Design Fingerprint — Everything That Is Banned

These are banned unless they exist in the client's actual brand tokens and live site.

---

### BANNED: Colour Effects

```
❌ Purple/indigo gradients — bg-indigo-500, #6366f1, #7c3aed (Tailwind defaults)
❌ Purple-to-blue gradient hero backgrounds
❌ Aurora/mesh gradient backgrounds — multi-colour blobs on dark bg
❌ Neon glow on text — text-shadow with bright colour
❌ Neon glow on buttons — box-shadow with neon colour, especially:
     box-shadow: 0 0 20px rgba(99, 102, 241, 0.5)    /* indigo glow */
     box-shadow: 0 0 30px rgba(139, 92, 246, 0.6)    /* purple glow */
     box-shadow: 0 0 15px rgba(16, 185, 129, 0.5)    /* green glow */
❌ Glowing card borders — border with neon colour + box-shadow glow
❌ Glowing orbs / light blobs as background decoration
❌ Pulsing glow animation on any element
❌ Neon accent colour on dark background (cyberpunk aesthetic)
❌ Generic teal #14b8a6 as brand colour
❌ ChatGPT green #10b981 as brand colour
❌ Any gradient unless confirmed in design-tokens.md
```

---

### BANNED: Surface and Material Effects

```
❌ Glassmorphism — backdrop-filter: blur() + rgba transparent background
   The exact pattern: background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);
❌ Neumorphism — soft inset/outset shadows that mimic physical depth
❌ Frosted glass cards on hero backgrounds
❌ Semi-transparent overlays with blur on any card
❌ "Floating" cards with large soft shadows
   The exact pattern: box-shadow: 0 25px 50px rgba(0,0,0,0.15)
❌ Noise/grain texture overlays on backgrounds (unless brand-confirmed)
❌ Mesh gradient backgrounds
❌ Stripe-style "glow behind content" on dark sections
```

---

### BANNED: Layout Patterns

```
❌ Three-column feature card grid with icon + heading + two lines of body text
❌ Bento grid layout (2x2, 3x2 asymmetric blocks) — peaked 2023, now dated
❌ Hero with centred headline + subheadline + two buttons side by side
❌ "Trusted by 500+ companies" logo strip immediately below hero
❌ Alternating left/right content + image sections repeated 3+ times
❌ Footer with four exactly equal columns of links
❌ Pricing table with three cards, middle one highlighted in purple
❌ "How it works" section with large numbered circles 1, 2, 3
❌ Full-width dark section immediately after white hero
❌ FAQ accordion at the bottom with no CTA after it
❌ "As seen in" press logo strip in grey
```

---

### BANNED: Typography Effects

```
❌ Gradient text — background-clip: text with purple-to-blue gradient
❌ Oversized decorative quotes in light grey behind testimonials
❌ ALL CAPS body text (except where confirmed brand style)
❌ Inter as a design choice (acceptable only if confirmed in design-tokens.md)
❌ Space Grotesk as heading font
❌ DM Sans, Outfit as primary fonts
❌ Letter-spaced ALL CAPS heading in indigo/purple
```

---

### BANNED: Component Patterns

```
❌ Pill badges in pale purple or pale blue with emoji
   e.g. <span class="badge">⚡ New feature</span> in indigo-100
❌ Generic checkmark lists in green — ✓ Feature one ✓ Feature two
❌ Gradient CTA button — "Get started free →" on indigo-to-purple gradient
❌ Circular avatar placeholder in testimonials
❌ "Card with soft shadow on white background" as the only content container
❌ Icon + heading + 2-line description as the sole feature presentation format
❌ Sticky nav that becomes opaque with backdrop blur on scroll
❌ Animated counter numbers (87K users, 99% satisfaction) on dark bg
❌ Large decorative emoji as section icons (🚀 ✨ 💡 ⚡ 🎯)
```

---

### BANNED: Animation Patterns

```
❌ Floating/levitating elements with CSS animation (transform: translateY bounce)
❌ Particles or stars moving in the background
❌ Typewriter effect on hero headline
❌ Scroll-triggered counter animations (numbers counting up)
❌ Pulsing ring animation around CTA button
❌ Gradient border animation (rotating conic gradient)
❌ Blob shape morphing animation
❌ Auto-scrolling logo marquee unless confirmed on real site
```

---

### BANNED: Copy Patterns

```
❌ "Trusted by X+ companies"
❌ "Built for modern teams"
❌ "The [adjective] platform for [category]"
❌ "Get started in minutes"
❌ "Everything you need in one place"
❌ "Simple, powerful, and [third thing]"
❌ Any statistic not confirmed on the real site
❌ Any testimonial not taken from the real site
❌ Any feature not confirmed on the real site
❌ Placeholder names (Sarah M., John D., Emma W.)
❌ Generic role titles (Product Manager at TechCorp)
```

---

## What AI Does Instead — The Replacement Rules

For every banned pattern, here is what to do instead:

| Banned | Replace with |
|---|---|
| Glow on button | Solid darker shade on hover. `background: darken(brand-colour, 10%)` |
| Gradient hero | Dark solid brand colour + real photography from design-tokens.md |
| Glassmorphism card | Solid white card with `1px solid #e5e7eb` border |
| Neon text glow | Bold font weight + high contrast colour — weight does the work |
| Aurora background | Clean white or light grey — let content breathe |
| Three feature cards | The actual page sections from the real site |
| Pill badge in indigo | Small ALL CAPS label in brand colour — `font-size: 12px; letter-spacing: 1px` |
| Generic testimonial | Real testimonial from the page — real name, real venue |
| Gradient CTA | Solid brand primary colour — `background: #00A651` (Powerleague) |
| Animated counter | Static numbers — let the data speak without performance |
| Floating element | Static placement — animation is for feedback, not decoration |
| Typewriter headline | The actual headline from the real page, set in brand font |

---

## The Glow Problem — Deep Explanation

Glows deserve specific attention because they are the single most common AI tell after purple gradients.

**Why AI defaults to glows:**
Training data is saturated with SaaS product showcases (Dribbble, ProductHunt, Linear, Vercel) which use glows as a design signature. AI associates "premium" and "modern" with glows because that correlation dominated 2021–2023 design content.

**Why glows are wrong for CRO mockups:**

1. **They signal "tech startup" not "your brand"** — a glow on Powerleague's booking button looks like Vercel's website, not Powerleague's
2. **They reduce accessibility** — glows often fail WCAG contrast ratios when text sits near the glowing element
3. **They date quickly** — glow aesthetics peaked in 2022 and already read as dated to design-literate eyes
4. **They distract from conversion** — the eye is drawn to the glow, not to the CTA copy
5. **They look wrong on light backgrounds** — glows require dark backgrounds to work; most CRO pages are light

**The only legitimate use of glow in CRO:**
A `box-shadow: 0 0 0 3px [brand-colour]` focus ring on form inputs when focused — this is a functional accessibility affordance, not a decorative glow.

```css
/* ALLOWED: functional focus ring only */
input:focus, button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 166, 81, 0.3); /* brand colour at low opacity */
}

/* BANNED: decorative glow on anything */
.card:hover {
  box-shadow: 0 0 30px rgba(99, 102, 241, 0.4); /* ❌ never */
}
.btn {
  box-shadow: 0 0 20px rgba(0, 166, 81, 0.5); /* ❌ never */
}
```

---

## The Brand Lock Rule

Once `design-tokens.md` is populated for a client, the mockup generator is locked to those values. No creative decisions are permitted on:
- Primary brand colour
- Secondary colours
- Heading font
- Body font
- Button border-radius
- Section padding scale

Creative decisions ARE permitted on:
- Layout composition (where elements sit on the page)
- Content hierarchy (what gets promoted above the fold)
- CRO-driven additions (adding a trust bar, repositioning social proof)
- Interaction design (as long as it matches brand personality)

The distinction: we are CRO designers, not brand designers. We change what converts. We preserve who they are.

---

## The Identity Test

Before finalising any mockup, ask: **"Could this mockup be for any other client?"**

If yes — it is too generic. Make it more specific:
- Does it use the client's exact colours?
- Does it use the client's actual font?
- Does it reference the client's real products and prices?
- Does it feel like this specific brand or like a template?

A Powerleague mockup should look like Powerleague, not like a sports startup landing page.
A Koalify mockup should look like Koalify, not like a generic fintech brand.

---

## Prompt Injection Block

The following block is appended to EVERY Anthropic API call that generates a mockup.
It fires before any HTML is written.

```
═══════════════════════════════════════════════════════════════
CRITICAL DESIGN CONSTRAINTS — NON-NEGOTIABLE
═══════════════════════════════════════════════════════════════

BEFORE WRITING A SINGLE LINE OF CSS, CONFIRM ALL OF THE FOLLOWING:

COLOUR:
✗ No purple, indigo or violet unless confirmed in design-tokens.md
✗ No gradients unless confirmed in design-tokens.md
✗ No neon glows on buttons, cards, text or any element
   (box-shadow with colour and blur spread is a glow — never use it except focus rings)
✗ No aurora, mesh, or blob backgrounds
✗ No glassmorphism (backdrop-filter: blur + rgba transparent)
✓ All colours from design-tokens.md only

TYPOGRAPHY:
✗ Not Inter, Roboto, Space Grotesk, DM Sans or Outfit unless confirmed in design-tokens.md
✗ No gradient text (background-clip: text)
✗ No neon text glow (text-shadow with colour)
✓ Font from design-tokens.md only
✓ Type scale from brain/design-principles.md (8pt aligned)

LAYOUT:
✗ No three-column feature card grid
✗ No bento grid
✗ No generic "how it works" numbered circles
✗ No generic logo strip with "Trusted by X+ companies"
✗ No floating/levitating elements
✗ No typewriter animation on headline
✓ Layout reflects the actual page being redesigned
✓ Structure solves the specific CRO problem identified

COPY:
✗ No invented statistics
✗ No fabricated testimonials
✗ No placeholder names (Sarah M., John D.)
✗ No generic phrases ("Built for modern teams", "Get started in minutes")
✓ ALL copy from the real page HTML provided
✓ CRO rewrites clearly annotated as such

COMPONENTS:
✗ No pill badges in indigo/purple
✗ No decorative emoji as section icons
✗ No circular avatar placeholders
✗ No gradient CTA buttons
✓ Components reflect the client's actual design system

THE IDENTITY TEST (run before finalising):
"Could this mockup be for any other client?"
If yes → make it more specific. Add client's real colours, real font, real products.

═══════════════════════════════════════════════════════════════
```
