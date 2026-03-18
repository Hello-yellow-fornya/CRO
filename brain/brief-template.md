# Test Brief Template — Mode 2 (Human Ideated)

Fill in what you know — Claude flags anything missing before proceeding.

## Brief

| Field | Your input |
|---|---|
| Client | |
| Page URL | |
| Test size | BIG / MEDIUM / SMALL |
| Your idea | Describe in plain English |
| The problem | What is not working right now? |
| Primary metric | What does success look like? |

## Optional

| Field | Your input |
|---|---|
| Specific element(s) | e.g. hero headline, CTA button |
| Copy direction | Any specific copy to test |
| Design direction | Any visual approach |
| Inspiration | URL or description |
| Device priority | All / Mobile-first / Desktop-first |

## What Claude Does With This

1. Reads client context file
2. Reads vertical knowledge base
3. Checks test database
4. Writes hypothesis
5. Builds mockup (BIG/MEDIUM)
6. Writes VWO code
7. Runs QA checklist

## Hypothesis Output Format

If we [change X] on [page],
then [metric] will [increase/decrease] by [target %],
because [reason].

Evidence: [knowledge base or test DB reference]
Test size: BIG / MEDIUM / SMALL
MDE target: X%
Estimated duration: X weeks
