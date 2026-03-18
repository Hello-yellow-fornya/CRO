# CRO Knowledge Base — Ecommerce

**Vertical:** Ecommerce — Product Sales and Checkout Optimisation
**Last updated:** March 2026
**Sources:** Baymard Institute, VWO AI Checkout Optimization ebook, industry benchmarks
**Benchmark conversion rate:** 2–3% average; 5%+ top performers; Food & Beverage 6.1%; Home & Furniture 1.2%

---

## 1. Buyer Psychology

Ecommerce buyers make fast, emotionally-driven decisions that are immediately rationalisable. Unlike B2B or financial services, the purchase cycle is short — often minutes. The primary job is to maintain momentum and remove doubt at each micro-decision point.

| Stage | Primary emotion | Primary barrier |
|---|---|---|
| Product discovery | Curiosity, desire | Is this right for me? |
| Product page | Intent | Can I trust this? Is it worth it? |
| Cart | Commitment | Do I really need this now? |
| Checkout | Anxiety | Is this safe? Will it arrive? |
| Post-purchase | Validation | Did I make the right choice? |

---

## 2. Top CRO Principles

### Principle 1: Product Page Optimisation
**Evidence: High**

The product page is the most important conversion point in ecommerce. Key elements in order of impact:

- **Imagery** — multiple angles, lifestyle shots, zoom functionality, video where applicable
- **AI-generated imagery** — use Runway ML or similar to create lifestyle/model variations for A/B testing without photography budget (from VWO AI Checkout ebook)
- **Social proof** — reviews with star rating prominently displayed near price, not at bottom
- **AI review summary** — use ChatGPT to summarise reviews into a 2–3 line trust signal placed above the review list ("Customers consistently love the comfort, accurate sizing, and quick delivery") — keeps social proof scannable
- **Value proposition** — lead with outcome or transformation, not technical specs
- **Delivery and returns** — visible on product page, not hidden in footer
- **Add to cart placement** — above fold on desktop and mobile
- **Urgency signals** — stock levels, delivery cutoffs ("Order by 3pm for next day delivery")

Tests that consistently win:
- Moving reviews above the fold — typically +8–15% add-to-cart
- Adding delivery/returns info to product page — +10–20% checkout starts
- Video on product page — +34% conversion on average
- Real-time stock indicators — +6–12% where authentic
- AI-summarised review snippet above review list — improves trust without adding length

---

### Principle 2: Checkout Optimisation
**Evidence: High — average checkout conversion rate 20–40%; Baymard reports 70%+ cart abandonment**

The checkout is where intent meets friction. Every additional step, field, or surprise costs conversions.

Best practices:
- Guest checkout always available — never force account creation
- Show order summary persistently throughout checkout
- Progress indicator at every step
- Delivery cost visible before checkout begins — surprise costs are the #1 abandonment reason
- Minimum form fields — name, email, address, payment only
- Multiple payment methods — card, PayPal, Apple/Google Pay
- Trust badges at payment step — SSL, security seals
- Single-page checkout vs multi-step: test per site, no universal winner

**AI checkout enhancements (from VWO AI Checkout ebook):**
- LLM-powered chat support embedded in checkout — answers shipping, payment, promo code questions instantly. Reduce "I had a question and left" abandonment
- Dynamic cart CTAs based on cart value — e.g. "You're £8 away from free shipping" → "Checkout + Bonus Gift" as cart value increases. Motivates higher order values without discounting
- Out-of-stock alternatives — AI suggests relevant in-stock alternatives when a product is unavailable, preventing exit to competitors
- Voice-enabled checkout — emerging but worth testing on high-mobile-traffic ecommerce sites

Tests that consistently win:
- Adding guest checkout option — typically +20–35% completion
- Showing delivery cost on product/cart page — reduces abandonment
- Adding Apple/Google Pay — +10–15% mobile checkout completion
- Dynamic cart value messaging — motivates higher cart value while reducing abandonment

---

### Principle 3: Cart Abandonment Recovery
**Evidence: High — abandoned cart email open rate ~50%; 19% of recipients convert**

The cart is not the end of the funnel. Recovery sequences are high ROI.

- First email within 1 hour — highest recovery rate
- Second email at 24 hours with social proof or review
- Third email at 72 hours with urgency or offer
- Exit-intent popup converts 4–8% of about-to-leave visitors

---

### Principle 4: Category Page Optimisation
**Evidence: Medium-High**

Category pages are often the most visited but least optimised pages in ecommerce.

Best practices:
- Filtering and sorting prominently available
- Product card: image, name, price, rating, key differentiator
- "Quick add to cart" without visiting product page
- Pagination vs infinite scroll: test per audience — mobile favours infinite scroll
- Personalisation: recently viewed, "based on your browsing"

---

### Principle 5: Homepage as Discovery Engine
**Evidence: Medium**

Homepage rarely converts directly. Its job is to route visitors to the right category or product fast.

Best practices:
- Clear product category navigation above fold
- Hero promotes highest-converting product/offer, not brand values
- Search is prominent — users who search convert 2–3x higher than browsers
- Social proof on homepage (aggregate reviews, press logos)
- Personalisation for returning visitors — show previously viewed categories

---

### Principle 6: Mobile Commerce
**Evidence: High — mobile accounts for ~66% of online retail purchases; mobile CVR 1–2% vs desktop 3–4%**

Mobile checkout is the biggest gap between traffic and revenue in most ecommerce sites.

Key mobile tests:
- Sticky add-to-cart bar on mobile product pages
- Single-column layout throughout checkout on mobile
- Auto-fill address using postcode lookup
- Native payment methods (Apple Pay, Google Pay)
- Thumb-zone CTA placement (bottom third of screen)
- Voice checkout for high-frequency buyers (emerging — monitor adoption)

---

## 3. AI-Powered Checkout Enhancements Summary

From VWO AI Checkout Optimization ebook — 8 proven AI hacks:

| Hack | What it does | Impact area |
|---|---|---|
| LLM checkout support | Instant answers to checkout questions | Reduces abandonment from unanswered queries |
| AI product imagery | Test lifestyle/model variations without photoshoots | Improves product page CVR |
| XAI cart abandonment insights | Explains why carts are abandoned, not just that they are | Hypothesis generation |
| Voice-enabled checkout | Spoken input for checkout fields | Mobile friction reduction |
| AI review summary | 2–3 line summary of all reviews near CTA | Trust signal density |
| AI out-of-stock alternatives | Auto-suggests in-stock similar products | Revenue recovery from stockouts |
| Floating checkout summary | Persistent order summary widget during checkout | Reduces uncertainty at payment |
| Dynamic cart value switching | CTA and messaging changes based on cart value | AOV uplift + abandonment reduction |

---

## 4. Benchmark Conversion Rates by Category

| Category | Average CVR | Notes |
|---|---|---|
| Food & Beverage | 6.1% | Habitual, low-risk purchase |
| Health & Beauty | 4.2% | High repeat purchase intent |
| Fashion & Apparel | 2.5% | High browse, high return rate |
| Home & Furniture | 1.2% | High consideration, long cycle |
| Electronics | 1.8% | High research phase before buy |
| Sports & Outdoors | 2.3% | Seasonal variation significant |

---

## 5. Hypothesis Templates

TEMPLATE A — Add to cart friction
If we add [delivery info / returns policy / stock indicator] to the product page,
then add-to-cart rate will increase because buyers need reassurance before committing.
MDE: 8–15% | Size: SMALL-MEDIUM

TEMPLATE B — Checkout guest option
If we add/improve the guest checkout option and move it above account creation,
then checkout completion rate will increase because forced registration is the top abandonment cause.
MDE: 20–35% | Size: MEDIUM

TEMPLATE C — AI review summary
If we add an AI-generated review summary (2–3 lines) above the review list near the CTA,
then add-to-cart rate will increase because trust signals are more scannable and appear earlier.
MDE: 8–15% | Size: SMALL

TEMPLATE D — Dynamic cart CTA
If we replace the static checkout button with a dynamic CTA that changes based on cart value
(e.g. "You're £X away from free shipping" → "Checkout + Bonus Gift"),
then average order value and checkout completion will increase.
MDE: 10–20% AOV uplift | Size: MEDIUM

TEMPLATE E — Mobile sticky CTA
If we add a sticky add-to-cart bar on mobile product pages,
then mobile add-to-cart rate will increase because the CTA is always accessible during scroll.
MDE: 10–20% | Size: SMALL

---

## 6. Key Metrics

| Page | Primary metric | Secondary |
|---|---|---|
| Homepage | Category/product click rate | Bounce rate, search usage |
| Category page | Product click rate, add-to-cart | Filter usage, pagination depth |
| Product page | Add-to-cart rate | Review engagement, image views |
| Cart | Checkout start rate | Cart abandonment rate, AOV |
| Checkout | Completion rate | Drop-off per step, payment method split |

---

## 7. Test Learnings Log

| Test ID | Hypothesis | Result | Uplift | Learning |
|---|---|---|---|---|
| — | — | — | — | Populate after first test |
