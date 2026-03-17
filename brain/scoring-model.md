# Test Priority Scoring Model

Every candidate test page is scored 0-100 before any work begins. Pages scoring below 30 are removed from the list entirely. Score determines build order.

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

| Weekly sessions | Score |
|---|---|
| 5,000+ | 25 |
| 2,500–4,999 | 20 |
| 1,000–2,499 | 15 |
| 500–999 | 8 |
| < 500 | 0 — remove from list |

---

## 2. Opportunity Score (25pts)

| Drop-off rate | Score |
|---|---|
| 70%+ | 25 |
| 50–69% | 20 |
| 35–49% | 14 |
| 20–34% | 8 |
| < 20% | 3 |

---

## 3. Evidence Score (20pts)

| Condition | Score |
|---|---|
| Knowledge base has proven pattern | +8 |
| Similar test won on another client | +6 |
| Similar test won on this client | +6 |
| No prior evidence | +3 |
| Similar test lost on this client recently | -5 |
| Similar test lost on this client twice | -10 |

---

## 4. Business Value Score (20pts)

Set per client in /clients/[client]/scoring.md

| Value tier | Score |
|---|---|
| Highest value conversion | 20 |
| Medium value conversion | 14 |
| Lower value conversion | 8 |
| Micro-conversion | 4 |

---

## 5. Readiness Score (10pts)

| Condition | Score |
|---|---|
| Not tested in 8+ weeks, no active test, not frozen | 10 |
| Tested 4–8 weeks ago | 6 |
| Tested in last 4 weeks | 2 |
| Active test already running | 0 — remove |
| Page frozen | 0 — remove |

---

## Score Interpretation

| Score | Status | Action |
|---|---|---|
| 80–100 | 🟢 Priority | Build immediately |
| 60–79 | 🟢 High | Queue next |
| 40–59 | 🟡 Medium | Queue after high |
| 30–39 | 🟡 Low | Consider if bandwidth allows |
| 0–29 | 🔴 Exclude | Remove from list |

---

## Test Duration Calculation
```
Duration (weeks) = Sample size needed / Weekly sessions

Flags:
  < 4 weeks  → Green
  4–8 weeks  → Amber
  > 8 weeks  → Red — deprioritise
```

---

## Portfolio Balance Rule

At any given time per client:
```
1 × BIG test
2 × MEDIUM tests
1 × SMALL test
```

Never run 2 BIG tests on the same client simultaneously.
Always have at least 1 SMALL test active per client.
