Split the onboarding workflow into two separate workflows and create PROMPTS.md. Commit with message "feat: gated onboarding — human review required between phases" and push to main.

---


---

## Gate 1: Review Phase A outputs

**When:** After Phase A workflow completes, before triggering Phase B.
**Files to attach:** `clients/[client]/research.md`, `clients/[client]/ga4-snapshot.json` (if present), `clients/[client]/audit-stage3-[date].csv` (if present)

**Paste this prompt:**

```
I've just run Phase A of the CRO OS onboarding for a new client.
Please review the attached outputs and walk me through Gate 1.

Files attached:
- research.md — Phase 1 machine research
- ga4-snapshot.json — GA4 data pull (if present)
- audit-stage3-[date].csv — tag audit (if present)

For each file, tell me:
1. What the machine got right that I should confirm
2. What is marked [UNCONFIRMED] that I need to answer
3. Whether the vertical classification looks correct
4. Whether the revenue lines and funnel map look accurate
5. Any GA4 data quality issues I should be aware of
6. Any tag audit failures that block the first test
7. Whether I'm safe to proceed to Phase B

Ask me clarifying questions for any [UNCONFIRMED] items.
Once we've resolved them, tell me exactly what to edit in research.md
before I trigger Phase B.
```

---

## Gate 2: Review onboarding report

**When:** After Phase B workflow completes, before the client is considered active.
**Files to attach:** `clients/[client]/onboarding-report.md`, `clients/[client]/research.md`

**Paste this prompt:**

```
Phase B is complete for [client name]. Please review the onboarding report
and walk me through Gate 2 — the final review before this client goes active.

Files attached:
- onboarding-report.md — the generated 10-section report
- research.md — Phase 1 research (for reference)

Walk me through each of the following decisions:

1. Section 1 — Client summary: does it accurately describe the business and revenue lines?
2. Section 2 — Tag audit: what are the CRITICAL failures that must be fixed before any test?
3. Section 4 — GA4 funnel setup: what exact steps do I need to take in GA4 this week?
4. Section 6 — Hypotheses: which of the 3 pre-data hypotheses is highest priority and why?
5. Section 9 — Immediate actions: confirm the priority order is right for where we are
6. Section 10 — 30-day plan: is week 4 "first test live" realistic given the actions in section 9?

Also:
- List every [UNCONFIRMED] item still in the report and ask me to resolve each one
- Tell me what to copy from section 9 into clients/[client]/off-limits.md
- Flag anything in the report that contradicts what I know about the client

Once we've gone through everything, summarise what I need to do before
the first test can be briefed.
```

---

## Ongoing: Brief a new test

**When:** Ready to start a new test for an active client.
**Files to attach:** `clients/[client]/ga4-snapshot.json`, `clients/[client]/research.md`, `clients/[client]/onboarding-report.md`

**Paste this prompt:**

```
I want to brief the next test for [client name].

Files attached:
- ga4-snapshot.json — current GA4 data
- research.md — client research
- onboarding-report.md — onboarding report with pre-data hypotheses

Using the CRO OS scoring model and intent-adjusted index framework:

1. Show me the P.I.E. scores for the candidate pages based on the GA4 data
2. Identify the highest-priority segment underperforming its intent benchmark
3. Identify which funnel stage that segment drops off
4. Generate a hypothesis in standard CRO OS format
5. Recommend BIG / MEDIUM / SMALL test size with MDE calculation
6. Tell me what the control HTML should capture (which page, which section)

Ask me any questions you need to generate a well-targeted hypothesis.
```

---

## Ongoing: Log test results

**When:** A test has concluded in VWO and you have the results.
**Files to attach:** `test-database/index.md`

**Paste this prompt:**

```
A test has just concluded for [client name]. Here are the results:

Test ID: [e.g. PL-001]
Page: [URL]
Hypothesis: [what was tested]
Result: [win / loss / inconclusive]
Primary metric uplift: [e.g. +12% form start rate]
Statistical significance: [e.g. 97%]
Duration: [e.g. 6 weeks]
Winning variation: [brief description]
Segments with notable differences: [e.g. mobile outperformed desktop]

Please:
1. Write the test database entry in the correct tagged format for test-database/index.md
2. Update the evidence score notes for similar hypotheses
3. If it won, describe what snippet should be added to tools/code-library/
4. Suggest the next hypothesis this result points to
5. Flag any segments worth investigating further based on the results breakdown
```

---

## Ongoing: Weekly funnel review

**When:** Monday morning after the GA4 weekly sync has run.
**Files to attach:** `clients/[client]/ga4-snapshot.json`

**Paste this prompt:**

```
The weekly GA4 sync has run for [client name]. Please review the snapshot
and give me this week's CRO intelligence briefing.

File attached:
- ga4-snapshot.json

Tell me:
1. How did this week's sessions and CVR compare to the previous period?
2. Which segments are underperforming their intent-adjusted benchmark this week?
3. Any new flags since last week — segments that have deteriorated?
4. Any segments that have improved — worth investigating why?
5. Is the current running test on track for its target MDE within the planned window?
6. What should I prioritise in CRO this week?

Keep it concise — bullet points, biggest signals first.
```

---

## Setup: Add a new client (before running Phase A)

**When:** About to onboard a new client. No files needed.

**Paste this prompt:**

```
I want to add a new client to CRO OS. Help me prepare everything
before I trigger Phase A.

Client details:
- Name: [client name]
- Website: [URL]
- What they do: [brief description]
- Their main goal: [what they want more of]
- Analytics: [GA4 yes/no, VWO yes/no]
- Known about their tech: [anything you know — WordPress, Shopify, etc.]

Walk me through the pre-Phase A checklist:
1. What slug should I use for the client folder?
2. Which vertical should I select, or should I use auto?
3. Do I need to find the GA4 property ID before running Phase A?
4. Is there anything about this client that suggests composite vertical?
5. What should I check in VWO before the audit runs?
6. Any other prep I should do first?

Once we've gone through the checklist, give me the exact inputs
to paste into the Phase A workflow dispatch form.
```
