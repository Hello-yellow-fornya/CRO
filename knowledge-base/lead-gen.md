# CRO Knowledge Base — Lead Generation / B2B

**Vertical:** B2B Lead Generation — Forms, Landing Pages, Demo and Enquiry Conversion
**Last updated:** March 2026
**Sources:** VWO 27 UX Principles ebook, Unbounce, First Page Sage, Directive, industry benchmarks
**Benchmark conversion rates:**
- Average B2B website: 2–3%
- Dedicated landing pages: 5–15%
- Organic search traffic: highest converting channel
- Email to landing page: ~2.4%

---

## 1. Buyer Psychology

B2B buyers are risk-averse and politically aware. They are often spending someone else's money and will be judged on the outcome. Decisions involve multiple stakeholders (4–6 on average for significant purchases). The primary job is to build enough trust and provide enough evidence for a single champion to justify the decision internally.

| Buyer type | Primary concern | What they need |
|---|---|---|
| Technical evaluator | Will it work / integrate? | Technical documentation, API docs, case studies |
| Financial decision maker | ROI justification | Cost savings, time saved, revenue impact |
| End user | Will this make my life easier? | Demo, screenshots, ease of use proof |
| Executive sponsor | Risk and reputation | Company credentials, client logos, references |

---

## 2. UX Psychology Principles for B2B (from VWO 27 UX Principles ebook)

These psychological principles have the highest impact on B2B website conversion:

**Cognitive Load** — B2B visitors are time-poor and purpose-driven. Every unnecessary element, redundant navigation link or excessive copy increases cognitive load and increases exit probability. Remove everything that doesn't serve the conversion goal.

**Confirmation Bias** — Write copy that validates what the visitor already believes about their problem before presenting your solution. Don't open with your product — open with their pain.

**Familiarity Bias** — Use familiar trust signals (G2, Clutch, LinkedIn, Google ratings) rather than only proprietary testimonials. B2B buyers trust familiar third-party validators.

**Goal Gradient Effect** — Multi-step forms with progress bars increase completion because people exert more effort as they approach the finish line. Use percentage completion indicators.

**Zeigarnik Effect** — Initiate a task before revealing the full requirement. "Click to download the guide" → reveals lead form. The unfinished task compels completion.

**Hick's Law** — Maximum 3 primary CTAs per page. Maximum 3–4 form fields in first step. More options = longer decisions = more abandonment.

**Peak-End Rule** — The form submission moment (peak) and the confirmation page (end) are disproportionately remembered. Make them exceptional. A poor confirmation page undermines an otherwise smooth journey.

**Loss Aversion** — Frame CTAs around what they lose by not acting. "Don't let competitors get ahead" outperforms "Find out more" in B2B tests.

**Reciprocity** — Give a valuable asset (calculator, benchmark report, assessment) before asking for contact details. The free gift creates obligation to reciprocate.

---

## 3. Top CRO Principles

### Principle 1: Landing Page Singularity
**Evidence: High — dedicated landing pages convert 5–15% vs 2–3% for full websites**

Every campaign should have a dedicated landing page with one goal and one CTA. Homepages and general service pages are not landing pages.

Best practices:
- Remove navigation from campaign landing pages
- Single CTA repeated 2–3 times down the page
- Headline matches ad copy exactly (message match / confirmation bias)
- Above-fold content answers: what is this, who is it for, what do I do next
- Remove anything that doesn't contribute to the single conversion goal

Tests that consistently win:
- Removing navigation from landing page — +10–25% conversion
- Single CTA vs multiple — +32% conversion (universal principle)
- Message match headline — +15–20% reduction in bounce

---

### Principle 2: Form Optimisation
**Evidence: High — 3–4 fields is the B2B sweet spot**

B2B form optimisation requires balancing volume and quality.

Best practices:
- Top of funnel: email only, or name + email (maximise volume)
- Mid funnel: name, email, company, phone (balance quality and volume)
- High-intent (demo request): add company size, job title (signals qualification)
- Progressive profiling: collect additional data on subsequent visits
- Never ask for budget on first form submission
- Label fields with outcomes: "Best email to send the guide to" not "Email"
- Inline validation — show errors as users type, not on submit
- Use SSO options (Google sign-in) to eliminate manual entry — reduces friction dramatically
- Goal Gradient Effect: add progress bar showing "Step 1 of 2" or completion percentage

Tests that consistently win:
- Multi-step forms vs single long form — +20–40% completion
- Removing phone number from top-of-funnel forms — +10–20% submissions
- Changing "Submit" to action-specific copy ("Get the report" / "Book my demo") — +5–15% completion
- Adding SSO option alongside email form — +15–25% completion on appropriate audiences

---

### Principle 3: Trust for High-Stakes B2B
**Evidence: High**

B2B buyers are making decisions that affect their careers. Trust signals must be professional, specific and verifiable.

In order of impact:
1. Logos of recognisable current clients — use familiarity bias with known brands
2. Specific case studies with named company, measurable outcome, timeframe
3. Regulatory credentials and accreditations
4. Awards and third-party recognition (G2, Clutch, industry awards)
5. Team credentials and photography (named people, not stock photos)
6. Press coverage and media mentions
7. Response time guarantee ("We'll be in touch within 2 hours")

---

### Principle 4: Stakeholder-Aware Messaging
**Evidence: Medium-High**

B2B landing pages are often shared internally before a decision is made. Create content that arms the champion to sell internally.

Best practices:
- Downloadable one-pagers, ROI calculators and comparison sheets
- Case studies formatted for internal sharing (exec summary + detail)
- Pricing page includes "for finance team" framing alongside features
- "Request a proposal" option alongside demo for committee-buying situations

---

### Principle 5: Speed to Follow-Up
**Evidence: High — companies that respond within 5 minutes are 9x more likely to convert**

The conversion does not end at form submission. The confirmation page and follow-up sequence are part of the CRO funnel.

Best practices:
- Confirmation page: set expectations ("You'll hear from us within 2 hours")
- Immediate automated email with relevant case study or resource
- CTA on confirmation page: "While you wait, read how [Company X] achieved [outcome]"
- Use Peak-End Rule: the confirmation page is the "end" of the journey — make it memorable, not a blank "thanks"
- Phone response within 5 minutes for demo requests during business hours

---

## 4. Key Metrics

| Page | Primary metric | Secondary |
|---|---|---|
| Landing page | Form completion rate | Scroll depth, time on page |
| Form | Field completion rate, abandonment per field | Drop-off field identification, hesitation time |
| Confirmation | Click-through to nurture content | Email open rate on follow-up |
| Overall funnel | MQL to SQL rate | Average deal cycle length |

---

## 5. Hypothesis Templates

TEMPLATE A — Navigation removal
If we remove the main navigation from [campaign landing page],
then form completion rate will increase because distractions are removed (Hick's Law).
MDE: 10–25% | Size: SMALL

TEMPLATE B — Multi-step form with progress
If we replace the single-page form with a multi-step form showing a progress bar,
then form completion rate will increase because commitment builds incrementally
(Goal Gradient Effect) and cognitive load is reduced per step.
MDE: 20–40% | Size: MEDIUM

TEMPLATE C — Social proof repositioning
If we add [client logo strip / specific case study outcome] above the form,
then form completion rate will increase because trust is established before commitment
(Familiarity Bias + Authority Bias).
MDE: 10–20% | Size: SMALL

TEMPLATE D — Loss aversion CTA
If we reframe the CTA from ["Get started"] to ["Don't let competitors get ahead — see how it works"],
then click-through rate will increase because loss aversion is a stronger motivator than gain in B2B.
MDE: 8–15% | Size: SMALL

TEMPLATE E — Zeigarnik effect lead capture
If we hide the form behind a "Download the report" button (revealing form on click)
rather than showing the form immediately,
then form completion rate will increase because the initiated task creates obligation to complete.
MDE: 10–20% | Size: SMALL

---

## 6. Test Learnings Log

| Test ID | Hypothesis | Result | Uplift | Learning |
|---|---|---|---|---|
| — | — | — | — | Populate after first test |
