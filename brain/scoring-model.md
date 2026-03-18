# Test Priority Scoring Model

Every candidate test page is scored 0–100 before any work begins. Pages scoring below 30 are removed from the list entirely. Score determines build order.

---

## Scoring Formula

```
Priority Score (0-100) =
  Traffic Score      (25pts)   ← Can we actually run this test?
+ Opportunity Score  (25pts)   ← How big is the drop-off?
+ Evidence Score     (20pts)   ← What does our DB + knowledge base say?
+ Business Value     (20pts)   ← What is a conversion worth here?
+ Readiness Score    (10pts)   ← Not frozen, not live, not recently tested
```

---

## 1. Traffic Score (25pts)

Based on weekly sessions to the candidate page.

| Weekly sessions | Score | Notes |
|---|---|---|
| 5,000+ | 25 | Green — test immediately |
| 2,500–4,999 | 20 | Green — viable |
| 1,000–2,499 | 15 | Amber — viable, longer duration |
| 500–999 | 8 | Amber — marginal, SMALL tests only |
| < 500 | 0 | Red — remove from list |

**Auto-remove rule:** Any page scoring 0 on traffic is excluded regardless of other scores.

---

## 2. Opportunity Score (25pts)

Based on funnel drop-off at that page.

| Drop-off rate | Score | Notes |
|---|---|---|
| 70%+ | 25 | Critical — highest priority |
| 50–69% | 20 | High opportunity |
| 35–49% | 14 | Medium opportunity |
| 20–34% | 8 | Low-medium opportunity |
| < 20% | 3 | Low opportunity |

**Data source:** GA4 funnel exploration report, exported per client.

---

## 3. Evidence Score (20pts)

Based on what the test database and knowledge base tell us.

| Condition | Score | Notes |
|---|---|---|
| Knowledge base has a proven pattern for this page/element | +8 | High confidence hypothesis |
| Similar test won on another client | +6 | Cross-client evidence |
| Similar test won on this client | +6 | Direct evidence |
| No prior evidence either way | +3 | Neutral — test is exploratory |
| Similar test lost on this client recently | -5 | Penalised — avoid repeating losers |
| Similar test lost on this client twice | -10 | Heavily penalised |

**Max score: 20. Can go negative — reducing overall score.**

---

## 4. Business Value Score (20pts)

Based on the value of a conversion on this page. Set per client in their scoring.md file.

| Conversion value | Score | Notes |
|---|---|---|
| Highest value conversion (client-defined) | 20 | |
| Medium value conversion | 14 | |
| Lower value conversion | 8 | |
| Micro-conversion / engagement | 4 | |

**Per-client weighting lives in:** `/clients/[client]/scoring.md`

---

## 5. Readiness Score (10pts)

Based on operational constraints.

| Condition | Score |
|---|---|
| Page not tested in 8+ weeks, no active test, not frozen | 10 |
| Page tested 4-8 weeks ago | 6 |
| Page tested in last 4 weeks | 2 |
| Active test already running on page | 0 |
| Page is frozen (brand, legal, dev) | 0 |

**Auto-remove rule:** Any page scoring 0 on readiness is excluded.

---

## Score Interpretation

| Score | Status | Action |
|---|---|---|
| 80–100 | 🟢 Priority | Build immediately |
| 60–79 | 🟢 High | Queue next |
| 40–59 | 🟡 Medium | Queue after high priority |
| 30–39 | 🟡 Low | Consider if bandwidth allows |
| 0–29 | 🔴 Exclude | Remove from list |

---

## Test Duration Calculation

For every prioritised test, calculate estimated duration before briefing:

```
Variables:
  - Weekly sessions to page (from GA4)
  - Current conversion rate on page (from GA4)
  - Minimum Detectable Effect: 10% (default, override per test)
  - Statistical significance: 95%
  - Statistical power: 80%

Duration (weeks) = Sample size needed / Weekly sessions

Flags:
  < 4 weeks  → Green
  4–8 weeks  → Amber
  > 8 weeks  → Red (deprioritise unless very high business value)
```

Claude Code calculates this automatically from GA4 export data.

---

## Test Type Classification

From VWO Experimentation Roadmap — classify every test before building:

| Type | Purpose | Example | When to use |
|---|---|---|---|
| Fixing | Correct broken or poor UX | Fix confusing form label | Always run first on new clients |
| Optimising | Incrementally improve what works | Better CTA copy | Most common, consistent ROI |
| Exploring | Test structural hypotheses | New page layout, different funnel order | Once fixing/optimising are exhausted |
| Innovating | Bold bets on new approaches | Entirely new product presentation | One per client per half year |

---

## Portfolio Balance Rule

At any given time per client, aim for:

```
1 × BIG test      (running or in build)
2 × MEDIUM tests  (running or in build)  
1 × SMALL test    (running — fast wins, keeps momentum)
```

Never run 2 BIG tests on the same client simultaneously.
Always have at least 1 SMALL test active per client.

---

## BFSI-Specific Scoring Modifier

For financial services clients, add a regulatory complexity modifier:

| Regulatory complexity | Modifier |
|---|---|
| Test involves regulatory copy (rates, credentials) | -5 (requires compliance review) |
| Test involves consent mechanisms | -10 (legal sign-off required) |
| Test is purely UX with no regulatory impact | 0 |

Source: VWO BFSI Experiment Prioritisation Matrix (Impact × Ease × Risk Reduction × Regulatory Complexity)


---

## P.I.E. Framework Reference

*(For prioritising both page-level and element-level optimisation opportunities)*

Rate each factor on a scale of 1–10:

| Factor | Question | Low score (1-3) | Mid score (4-6) | High score (7-10) |
|---|---|---|---|---|
| **P**otential | What improvement could fixing this deliver? | Small, niche issue | Moderate impact on a secondary metric | Major impact on primary conversion metric |
| **I**mportance | How valuable is the traffic to this page/screen? | Low traffic, low-intent | Medium traffic or medium-intent | High traffic AND high-intent (checkout, booking) |
| **E**ase | How difficult is the fix? | Complex dev work, multiple stakeholders, legal review | Moderate effort, some dependencies | CSS-only or copy change, no dev dependency |

**P.I.E. Score = (P + I + E) ÷ 3**

Prioritise highest scores first. Re-score the backlog quarterly as traffic patterns and business priorities change.

**Important nuance:** Ease should influence sequencing but not dominance. A high-Potential, high-Importance fix with low Ease (score: 7.0) should take priority over a low-Potential, low-Importance fix with high Ease (score: 5.0). Don't let Ease scores pull all work toward easy but insignificant tests.


## Test Duration and Segment Viability

### For scoring candidate pages

Before scoring a page, calculate whether it can support a meaningful test. Use the MDE viability check:

```
n_per_variant = (weekly page sessions × target weeks) / 2
achievable MDE = (2.80 × √(2p(1−p) / n)) / p

Where p = page conversion rate, target weeks = 8 (default)
```

If achievable MDE > 25% at 8 weeks → deprioritise unless business value is very high.
If achievable MDE > 25% even at 20 weeks → flag as low-traffic, SMALL tests only, manual analysis.

Readiness score is not affected — traffic scoring already penalises low-volume pages.

### For segment analysis

See `brain/funnel-analysis.md Part 2E` for the full segment viability model.

Key rule: **never use a blended CVR from aggregated segments to score a test hypothesis.** The CVR used in the MDE calculation must match the specific segment the test will run on. If you are running a test on all traffic, use the all-traffic CVR. If targeting returning users only, use the returning user CVR.

### Duration flags

| Weeks needed | Flag | Action |
|---|---|---|
| ≤4 | Green | Run |
| 5–8 | Green | Run — standard duration |
| 9–12 | Amber | Viable — plan capacity accordingly |
| 13–20 | Amber | Use Rule 5 extended window |
| >20 | Red | Do not run as standalone — aggregate or skip |
