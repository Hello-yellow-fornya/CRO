# Test Brief Template — Mode 2 (Human Ideated)

Fill in what you know — Claude will flag anything missing before proceeding.

---

## Brief

| Field | Your input |
|---|---|
| **Client** | |
| **Page URL** | |
| **Test size** | BIG / MEDIUM / SMALL |
| **Your idea** | Describe what you want to test in plain English |
| **The problem** | What's not working on the page right now? |
| **Primary metric** | What does success look like? |

---

## Optional

| Field | Your input |
|---|---|
| Specific element(s) | e.g. hero headline, CTA button, package cards |
| Copy direction | Any specific copy you want tested |
| Design direction | Any specific visual approach |
| Inspiration / reference | URL or description of something you've seen work |
| Device priority | All / Mobile-first / Desktop-first |
| Urgency | When does this need to be live? |

---

## What Claude Does With This

1. Reads client context file → understands design system and constraints
2. Reads vertical knowledge base → checks evidence for your idea
3. Checks test database → confirms this hasn't already been tested
4. Fills any gaps → asks only if something critical is missing
5. Writes hypothesis → formalises your idea into a testable statement
6. Classifies size → confirms BIG/MEDIUM/SMALL
7. Builds mockup (BIG/MEDIUM) → full-page HTML faithful to client design system
8. Writes VWO code → variation JS/CSS ready to implement
9. Runs QA checklist → flags any issues before handover

---

## Hypothesis Output Format
```
If we [change X] on [page/element],
then [primary metric] will [increase/decrease] by [target %],
because [psychological/behavioural reason].

Evidence: [knowledge base principle or test database reference]
Test size: BIG / MEDIUM / SMALL
MDE target: X%
Estimated duration: X weeks
```

---

## Example

| Field | Example |
|---|---|
| **Client** | Powerleague |
| **Page URL** | powerleague.com/football-birthday-party |
| **Test size** | MEDIUM |
| **Your idea** | Move the 93% recommendation stat to the top of the page |
| **The problem** | Parents bouncing before they see our strongest trust signal |
| **Primary metric** | Clicks on BOOK PARTY buttons |
| Specific element | Hero section — add trust badge below headline |
| Device priority | All, especially mobile |
