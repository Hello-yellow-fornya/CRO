# Test Priority Scoring Model
Every candidate test page is scored 0–100 before any work begins. Pages below 30 are removed.
## Scoring Formula
Priority Score = Traffic (25) + Opportunity (25) + Evidence (20) + Business Value (20) + Readiness (10)
## 1. Traffic Score (25pts)
| Weekly sessions | Score |
|---|---|
| 5,000+ | 25 |
| 2,500–4,999 | 20 |
| 1,000–2,499 | 15 |
| 500–999 | 8 |
| < 500 | 0 — remove from list |
## 2. Opportunity Score (25pts)
| Drop-off rate | Score |
|---|---|
| 70%+ | 25 |
| 50–69% | 20 |
| 35–49% | 14 |
| 20–34% | 8 |
| < 20% | 3 |
## 3. Evidence Score (20pts)
| Condition | Score |
|---|---|
| Knowledge base proven pattern | +8 |
| Similar test won on another client | +6 |
| Similar test won on this client | +6 |
| No prior evidence | +3 |
| Similar test lost recently | -5 |
| Similar test lost twice | -10 |
## 4. Business Value Score (20pts)
Set per client in /clients/[client]/scoring.md
| Value tier | Score |
|---|---|
| Highest value conversion | 20 |
| Medium value conversion | 14 |
| Lower value conversion | 8 |
| Micro-conversion | 4 |
## 5. Readiness Score (10pts)
| Condition | Score |
|---|---|
| Not tested 8+ weeks, no active test, not frozen | 10 |
| Tested 4–8 weeks ago | 6 |
| Tested in last 4 weeks | 2 |
| Active test running | 0 — remove |
| Page frozen | 0 — remove |
## Score Interpretation
| Score | Action |
|---|---|
| 80–100 | Build immediately |
| 60–79 | Queue next |
| 40–59 | Queue after high priority |
| 30–39 | Consider if bandwidth allows |
| 0–29 | Remove from list |
## Portfolio Balance
Per client at any time: 1 x BIG + 2 x MEDIUM + 1 x SMALL
Never run 2 BIG tests on the same client simultaneously.
