# Test Database — Master Index

Every test ever run, across all clients. Tagged for cross-client searching.

---

## Tag Taxonomy

```
#vertical        → financial-services | leisure-sports | ecommerce | saas | lead-gen
#page-type       → homepage | landing | pdp | checkout | form | calculator | booking-flow
#element         → cta | headline | social-proof | package | form | layout | imagery | nav | urgency | pricing
#hypothesis-type → friction-reduction | trust | clarity | urgency | personalisation | social-proof | hierarchy | simplification
#device          → all | mobile-primary | desktop-primary
#size            → big | medium | small
#result          → win | loss | inconclusive | running | paused
```

---

## How To Search

To find all winning CTA tests:
→ Search `#element:cta #result:win`

To find all trust tests in leisure vertical:
→ Search `#vertical:leisure-sports #hypothesis-type:trust`

To find all losing form tests (avoid repeating):
→ Search `#element:form #result:loss`

To find all big tests run on Powerleague:
→ Search `client:powerleague #size:big`

---

## Test Log

| Test ID | Client | Date | Page | Hypothesis summary | Tags | Result | Uplift | Notes |
|---|---|---|---|---|---|---|---|---|
| — | — | — | — | Populate after first test | — | — | — | — |

---

## Test Entry Template

When adding a new test, create a file at:
`/clients/[client]/tests/[test-id]/brief.md`

And add a row to the table above using this format:

```
| PL-001 | Powerleague | Apr 2026 | /football-birthday-party | Moving 93% trust stat to hero increases booking starts | #vertical:leisure-sports #page-type:landing #element:social-proof #hypothesis-type:trust #device:all #size:small #result:running | Running | — | — |
```

---

## Cross-Client Learnings

*Populate this section as patterns emerge across clients.*

| Pattern | Vertical | Evidence | Tests |
|---|---|---|---|
| — | — | — | — |
