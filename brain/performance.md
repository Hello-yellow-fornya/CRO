# Performance & Load Time Bible
**Status:** MANDATORY — referenced in every mockup and hypothesis generation
**Last updated:** March 2026
**Sources:** Google CrUX 2025, Cloudflare, Deloitte, Akamai, web.dev, NitroPack
Performance is not a technical concern. It is a conversion concern.
Every second of delay is a tax on every other CRO improvement you make.
A perfectly optimised page that loads in 5 seconds will underperform a mediocre page that loads in 1 second.
---
## The Business Case — Memorise These
| Delay | Conversion impact |
|---|---|
| +1 second load time | −7% conversions, −11% page views, −16% satisfaction |
| +1 second on mobile | −20% conversions |
| 1s → 3s load time | +32% bounce rate |
| 1s → 5s load time | +90% bounce rate |
| 1s → 10s load time | +123% bounce rate |
| 0.1s improvement | +8.4% retail conversions, +10.1% travel conversions |
| Pages loading in 1s vs 5s | 3× higher conversion rate |
| 53% of mobile users | Leave if page takes >3 seconds |
| 47% of users | Expect page in ≤2 seconds |
**Real case studies:**
- Walmart: 100ms faster → +1% revenue. 1s faster → +2% conversions
- Mobify: 100ms faster checkout → +1.55% conversions
- Agrofy: 70% LCP improvement → 76% drop in load abandonment
- Staples: 1s faster homepage → ~10% more conversions
- Deloitte: 0.1s faster → 8% more retail conversions, 10% more customer spend
- A site loading in 1s has a 9.6% conversion rate. At 5s it's 3.3%. That is a 191% difference.
**The compounding problem:** Performance debt compounds. A slow site costs you traffic (SEO), then costs you conversions (CRO), then costs you repeat visits (trust). Fix it first, optimise everything else second.
---
## Core Web Vitals — The Non-Negotiables
Google's three official metrics. Ranking factors AND conversion factors.
### LCP — Largest Contentful Paint (Loading)
**What it measures:** How long until the largest visible element loads (usually the hero image or headline)
**Good:** ≤ 2.5 seconds
**Needs work:** 2.5–4.0 seconds
**Poor:** > 4.0 seconds
Only 57.8% of websites currently pass LCP. 73% of mobile pages have an image as their LCP element.
**What kills LCP:**
- Unoptimised hero image (largest single cause — 35% of LCP images not in initial HTML)
- Slow server response / TTFB over 200ms
- Render-blocking JavaScript and CSS
- No CDN — serving assets from single origin far from users
- Client-side rendering (JS must execute before content shows)
- Fonts not preloaded (text renders late)
**What fixes LCP:**
```html
<!-- 1. Preload the LCP image — single biggest win, costs nothing -->
<link rel="preload" as="image" href="/hero.webp" fetchpriority="high">
<!-- 2. fetchpriority on the img tag itself -->
<img src="/hero.webp" fetchpriority="high" alt="..." width="1200" height="600">
<!-- 3. Never lazy-load above-the-fold images -->
<img src="/hero.webp" loading="eager"> <!-- NOT loading="lazy" for hero -->
<!-- 4. Lazy-load everything below the fold -->
<img src="/product.webp" loading="lazy" width="400" height="300">
```
**Image format priority:**
1. AVIF — best compression, newest (Chrome, Firefox, Safari 16+)
2. WebP — excellent compression, near-universal support
3. JPEG — fallback only
4. Never PNG for photos (file sizes too large)
```html
<!-- Correct implementation with modern format + fallback -->
<picture>
  <source srcset="/hero.avif" type="image/avif">
  <source srcset="/hero.webp" type="image/webp">
  <img src="/hero.jpg" alt="..." width="1200" height="600" fetchpriority="high">
</picture>
```
**Responsive images (srcset) — load right size for device:**
```html
<img
  srcset="/hero-400.webp 400w, /hero-800.webp 800w, /hero-1200.webp 1200w"
  sizes="(max-width: 768px) 100vw, 50vw"
  src="/hero-1200.webp"
  alt="..."
  width="1200"
  height="600"
  fetchpriority="high"
>
```
---
### INP — Interaction to Next Paint (Interactivity)
**What it measures:** How quickly page responds to clicks, taps, keyboard input across the ENTIRE session
*(Replaced FID in March 2024 — FID only measured first interaction)*
**Good:** ≤ 200ms
**Needs work:** 200–500ms
**Poor:** > 500ms
**What kills INP:**
- Long-running JavaScript tasks blocking the main thread
- Heavy third-party scripts (analytics, chat widgets, ad scripts)
- Inefficient event handlers triggering expensive operations
- Too much JavaScript parsed on load (no code splitting)
- VWO script itself if not implemented correctly (see below)
**What fixes INP:**
- Defer non-critical JS: `<script defer src="...">` or `<script async src="...">`
- Load analytics after page interactive, not in `<head>`
- Break long tasks into smaller chunks with `setTimeout` or `scheduler.postTask`
- Remove unused JavaScript — audit with Chrome DevTools Coverage tab
- Load third-party chat widgets only on user interaction, not on page load
---
### CLS — Cumulative Layout Shift (Visual Stability)
**What it measures:** How much content unexpectedly moves while loading
**Good:** < 0.1
**Needs work:** 0.1–0.25
**Poor:** > 0.25
70% of users cite visual stability as critical to trust. Content jumping = broken trust.
**What kills CLS:**
- Images without explicit width and height attributes
- Web fonts causing text reflow (FOUT — Flash of Unstyled Text)
- Ads, embeds, iframes injecting content after load
- Dynamic content inserted above existing content
- Animations that change layout properties (width, height, top, left)
**What fixes CLS:**
```html
<!-- ALWAYS set width and height on images — even if CSS overrides them -->
<!-- Browser uses these to reserve space before image loads -->
<img src="..." width="800" height="450" alt="...">
<!-- Reserve space for dynamic content -->
<div style="min-height: 250px;">
  <!-- ad or dynamic content loads here -->
</div>
```
```css
/* Font loading — prevent FOUT */
@font-face {
  font-family: 'BrandFont';
  src: url('/fonts/brand.woff2') format('woff2');
  font-display: swap; /* shows fallback immediately, swaps when ready */
  /* Use 'optional' for non-critical fonts — won't cause layout shift at all */
}
/* Animations — NEVER animate layout properties */
/* BAD — causes CLS */
.element { transition: height 300ms; }
/* GOOD — GPU-accelerated, no layout impact */
.element { transition: transform 300ms; }
```
---
## The Performance Hierarchy — Fix In This Order
Not all performance fixes are equal. This is the priority order by effort vs impact:
### Tier 1 — Free, Immediate, Highest Impact
**1. Preload the LCP image**
One line of HTML. Single biggest LCP win available. Zero cost.
```html
<link rel="preload" as="image" href="/hero.webp" fetchpriority="high">
```
**2. Set width and height on all images**
Prevents CLS. Zero cost. Should already be there — if not, add immediately.
**3. Remove unused JavaScript**
Check Chrome DevTools → Coverage tab. Most sites have 30–60% unused JS on load.
Delete it or defer it with `defer` attribute.
**4. Defer non-critical scripts**
```html
<!-- BAD — blocks rendering -->
<script src="analytics.js"></script>
<!-- GOOD — doesn't block -->
<script src="analytics.js" defer></script>
<!-- GOOD — loads in parallel, executes immediately when ready -->
<script src="non-critical.js" async></script>
```
**5. Inline critical CSS**
The CSS needed to render above-the-fold content goes in `<style>` in `<head>`.
Everything else loads with `<link rel="stylesheet" media="print" onload="this.media='all'">` (deferred).
---
### Tier 2 — Low Cost, High Impact
**6. Convert images to WebP/AVIF**
Tools: Squoosh (free, browser-based), ImageOptim, Cloudinary (paid, auto-serves optimal format)
WordPress: ShortPixel, Imagify plugins handle this automatically.
Typical size reduction: JPEG → WebP = 25–35% smaller. JPEG → AVIF = 40–50% smaller.
**7. Implement lazy loading below the fold**
```html
<img src="..." loading="lazy" width="..." height="...">
```
Native browser feature. No JavaScript needed. Apply to every image NOT in the first viewport.
**8. Enable browser caching**
Set appropriate cache headers on server:
```
Cache-Control: public, max-age=31536000, immutable  /* for hashed assets */
Cache-Control: public, max-age=3600                  /* for HTML */
```
WordPress: WP Rocket or LiteSpeed Cache handles this automatically.
**9. Enable Gzip/Brotli compression**
Reduces text file sizes (HTML, CSS, JS) by 60–80%.
Brotli is preferred over Gzip — check hosting control panel.
Cloudflare enables this automatically if used.
**10. Use a CDN**
Serves assets from servers close to the user.
Cloudflare (free tier): adds caching, compression, DDoS protection automatically.
Biggest impact for globally distributed audiences.
---
### Tier 3 — Moderate Cost, Targeted Impact
**11. Optimise server response time (TTFB)**
Target: < 200ms Time to First Byte
- Upgrade from shared hosting if TTFB > 600ms consistently
- Enable server-side caching (Redis, Varnish, or WP Rocket page cache)
- Use nearest data centre to primary audience
**12. Eliminate render-blocking resources**
Every CSS and JS file in `<head>` without `defer`/`async` blocks rendering.
Audit with PageSpeed Insights → "Eliminate render-blocking resources".
**13. Reduce third-party scripts**
92% of sites have at least one third-party script. Each one is a performance tax.
Audit every third-party: GA4, VWO, chat widget, heatmap, pixel, tag manager.
Load all of them through Google Tag Manager rather than directly in code.
Set GTM triggers to fire AFTER page load, not immediately.
**14. Preconnect to external origins**
```html
<!-- Tells browser to establish connection early -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```
---
## VWO-Specific Performance Rules
VWO introduces its own performance overhead that must be managed carefully.
**The VWO script must be in `<head>` synchronously** — this is non-negotiable for VWO to work (prevents flicker). But it is also the single biggest performance cost of running any A/B testing tool.
**Mitigations:**
1. Only run VWO on pages being actively tested — not site-wide on every page
2. Keep variation code lightweight — no heavy JS frameworks, no API calls in variation code
3. Use CSS-only variations where possible — significantly faster than JS DOM manipulation
4. Avoid loading images in variations that weren't preloaded — causes LCP regression
5. Test VWO's impact: run PageSpeed Insights with and without VWO active. Know your baseline cost.
6. Set variation timeout in VWO settings (100ms recommended) — prevents blank page if VWO script fails
**VWO async loading (for non-critical pages):**
VWO supports async loading which removes the render-blocking penalty but introduces flicker risk. Use only on pages where visual flicker is acceptable (thank you pages, logged-in states).
---
## Performance in Mockup Generation
When generating HTML mockups, apply these rules so mockups reflect achievable performance:
### Image Handling in Mockups
```html
<!-- Hero image (LCP element) — always eager, always fetchpriority high -->
<img
  src="[real URL from design-tokens.md]"
  alt="[descriptive alt text]"
  width="1200"
  height="600"
  fetchpriority="high"
  loading="eager"
>
<!-- Below-fold images — always lazy -->
<img
  src="[real URL]"
  alt="[descriptive]"
  width="400"
  height="300"
  loading="lazy"
>
```
### Font Loading in Mockups
```html
<!-- In <head> — preconnect to font origin -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<!-- Load only the weights actually used -->
<!-- BAD: loading all weights -->
<link href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@100;200;300;400;500;600;700;800;900">
<!-- GOOD: loading only weights confirmed in design-tokens.md -->
<link href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;600;900&display=swap">
<!-- display=swap prevents FOUT blocking render -->
```
### CSS in Mockups
```html
<!-- Critical styles inline in <head> — no render blocking -->
<style>
  /* Above-fold layout, hero section, navigation */
  /* Typography base styles */
  /* Colour variables */
</style>
<!-- Non-critical styles deferred -->
<link rel="stylesheet" href="styles.css" media="print" onload="this.media='all'">
```
### JavaScript in Mockups
```html
<!-- No JS in <head> unless absolutely required -->
<!-- All scripts at end of <body> with defer -->
<script src="main.js" defer></script>
<!-- Third-party scripts load last -->
<script src="analytics.js" async></script>
```
### What NOT to Include in Mockups (Performance Killers)
```
❌ Video backgrounds (autoplay) — huge bandwidth, blocks LCP
❌ Multiple font families — each is a network request
❌ Unoptimised placeholder images (picsum.photos) — unpredictable load times
❌ Inline SVG animations with complex paths — CPU intensive
❌ CSS backdrop-filter: blur() — GPU intensive, banned anyway (anti-AI layer)
❌ Large CSS animations on elements that aren't the focus of the test
❌ External scripts loaded synchronously in <head>
❌ Images without width and height attributes
```
---
## CLS Prevention Checklist for Mockups
Every mockup must not introduce layout shift. Check:
- [ ] Every `<img>` has `width` and `height` attributes
- [ ] Font loading uses `font-display: swap` or `font-display: optional`
- [ ] No content injected dynamically above existing content without reserved space
- [ ] Animation uses `transform` and `opacity` only — never `width`, `height`, `top`, `left`
- [ ] No iframes without explicit dimensions
- [ ] No ads or embeds without reserved space containers
---
## Performance Targets for Client Sites
When diagnosing pages and scoring hypotheses, use these benchmarks:
| Metric | Good | Acceptable | Fix urgently |
|---|---|---|---|
| LCP | < 2.5s | 2.5–4.0s | > 4.0s |
| INP | < 200ms | 200–500ms | > 500ms |
| CLS | < 0.1 | 0.1–0.25 | > 0.25 |
| TTFB | < 200ms | 200–600ms | > 600ms |
| Page weight | < 1MB | 1–3MB | > 3MB |
| JS payload | < 300KB | 300KB–1MB | > 1MB |
| Image weight | < 500KB total | 500KB–1.5MB | > 1.5MB |
**Tools to measure:**
- PageSpeed Insights — pagespeed.web.dev — free, uses real field data
- Chrome DevTools — Lighthouse tab — lab testing
- web.dev/measure — detailed CWV breakdown
- Search Console — Core Web Vitals report — site-wide real user data
- WebPageTest — advanced waterfall analysis
---
## Performance as a CRO Hypothesis
Performance fixes are valid CRO tests and often the highest-ROI ones.
**When to log as a CRO hypothesis:**
- LCP > 4 seconds on a high-traffic conversion page
- CLS > 0.25 on a form page (shifts confuse users, cause mis-clicks)
- Page weight > 3MB on mobile landing page
- Third-party scripts adding > 500ms to TTI
**Hypothesis template:**
```
We believe that [reducing LCP from Xs to Ys on the [page]] will [reduce bounce rate]
because [53% of mobile users leave pages that take >3s to load] which will result in
[more users reaching the CTA and primary conversion event].
Evidence: Google PageSpeed Insights field data showing LCP at Xs
Priority score impact: +Traffic (if organic) + Opportunity (direct conversion)
Test type: Fixing
Test size: SMALL (server/asset change) or MEDIUM (layout restructure)
Success metric: LCP improvement confirmed in CrUX + bounce rate reduction in GA4
```
**Performance scoring modifier:**
Add to `brain/scoring-model.md`:
- Page LCP > 4s: +15 to Opportunity score (performance is the conversion problem, not UX)
- Page CLS > 0.25: +10 to Opportunity score (layout instability = form mis-clicks)
- Page LCP < 2s: −5 to Readiness score (performance is already solved, focus elsewhere)
