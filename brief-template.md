# Test Brief Template — Mode 2 (Human Ideated)

Use this when you have an idea and want Claude to build it out.
Fill in what you know — Claude will flag anything missing before proceeding.

---

## Brief

| Field | Your input |
|---|---|
| **Client** | |
| **Page URL** | |
| **Test size** | BIG / MEDIUM / SMALL |
| **Your idea** | Describe what you want to test in plain English |
| **The problem you're solving** | What's not working on the page right now? |
| **Primary metric** | What does success look like? (e.g. form starts, booking completions) |

---

## Optional — Fill In If You Know

| Field | Your input |
|---|---|
| Which specific element(s) | e.g. hero headline, CTA button, package cards |
| Copy direction | Any specific copy you want tested |
| Design direction | Any specific visual approach |
| Inspiration / reference | URL or description of something you've seen work |
| Device priority | All / Mobile-first / Desktop-first |
| Urgency | When does this need to be live? |

---

## What Claude Does With This

1. Reads client context file → understands their design system and constraints
2. Reads vertical knowledge base → checks if there's evidence for your idea
3. Checks test database → confirms this hasn't already been tested
4. Fills any gaps → asks only if something critical is missing
5. Writes hypothesis → formalises your idea into a testable statement
6. Classifies size → confirms BIG/MEDIUM/SMALL and whether mockup is needed
7. Builds mockup (BIG/MEDIUM) → full-page HTML, faithful to client design system
8. Writes VWO code → variation JS/CSS ready to implement
9. Runs QA checklist → flags any issues before handover

---

## Hypothesis Format

Claude will output a hypothesis in this format:

```
If we [change X] on [page/element],
then [primary metric] will [increase/decrease] by [target %],
because [psychological/behavioural reason].

Evidence: [reference to knowledge base principle or test database]
Test size: BIG / MEDIUM / SMALL
MDE target: X%
Estimated duration: X weeks (based on [N] weekly sessions)
```

---

## Example Completed Brief

| Field | Example |
|---|---|
| **Client** | Powerleague |
| **Page URL** | powerleague.com/football-birthday-party |
| **Test size** | MEDIUM |
| **Your idea** | Move the 93% recommendation stat to the top of the page near the hero CTA |
| **The problem** | Parents are bouncing before they see the most powerful trust signal we have |
| **Primary metric** | Booking flow starts (clicks on BOOK PARTY buttons) |
| Which element | Hero section — add trust badge below headline |
| Device priority | All (but especially mobile) |
