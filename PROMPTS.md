# CRO OS — Prompts

All onboarding and test cycle work runs in Claude Code. These prompts are for
the ongoing test cycle — paste them into Claude Code (this conversation) when
you reach that stage of the workflow.

---

## Onboarding a new client

Run this in Claude Code. It handles all phases interactively with review gates.

```bash
node tools/onboard/run.js --client <slug> --url <url> --name "Display Name"
```

Example:
```bash
node tools/onboard/run.js --client chelseapiers --url https://www.chelseapiers.com --name "Chelsea Piers"
```

To resume from a specific phase after fixing something:
```bash
node tools/onboard/run.js --client chelseapiers --from report
node tools/onboard/run.js --client chelseapiers --from ga4
```

**Gates:** The script pauses after Phase 1 (research review) and after Phase 4
(audit + tokens review) before generating the report. At each gate, Claude
reviews the outputs, flags issues, and asks you to confirm or correct before
proceeding. You can ask follow-up questions or make corrections in the terminal.

---

## Brief a new test

Paste this into Claude Code when ready to start a new test.

```
I want to brief the next test for [client name].

Please read:
- clients/[client]/ga4-snapshot.json
- clients/[client]/research.md
- clients/[client]/onboarding-report.md
- clients/[client]/scoring.md
- test-database/index.md

Using the CRO OS scoring model and intent-adjusted index:

1. Show me P.I.E. scores for candidate pages from the GA4 data
2. Identify the segment most underperforming its intent benchmark
3. Identify the specific funnel stage where it drops
4. Generate a hypothesis in standard CRO OS format
5. Recommend BIG / MEDIUM / SMALL with MDE calculation
6. Tell me what the control HTML should capture

Ask me any questions needed for a well-targeted hypothesis.
```

---

## Log test results

Paste this when a test concludes in VWO.

```
A test has just concluded for [client name]. Results:

Test ID: [e.g. PL-001]
Page: [URL]
Hypothesis: [what was tested]
Result: [win / loss / inconclusive]
Primary metric uplift: [e.g. +12% form start rate]
Statistical significance: [e.g. 97%]
Duration: [e.g. 6 weeks]
Winning variation: [brief description]
Segment differences: [e.g. mobile outperformed desktop]

Please read test-database/index.md and:
1. Write the test database entry in the correct tagged format
2. Note any evidence score updates for similar hypotheses
3. If it won, describe what snippet to add to tools/code-library/
4. Suggest the next hypothesis this result points to
5. Flag any segments worth investigating from the breakdown
```

---

## Weekly funnel review

Paste this on Monday after the GA4 weekly sync has run.

```
Weekly GA4 sync has run for [client name].
Please read clients/[client]/ga4-snapshot.json and give me this week's briefing:

1. Sessions and CVR vs previous period
2. Segments underperforming their intent benchmark
3. New flags since last week
4. Any improving segments worth investigating
5. Is the current running test on track for target MDE?
6. Top priority for CRO this week

Keep it brief — biggest signals first.
```

---

## Pre-onboarding checklist

Paste this before running the onboarding script for a new client.

```
I want to onboard a new client to CRO OS. Help me prepare.

Client details:
- Name: [client name]
- Website: [URL]
- What they do: [description]
- Main goal: [what they want more of]
- Analytics: [GA4 yes/no, VWO yes/no]
- Tech stack: [anything you know]

Walk me through:
1. What slug should I use?
2. Which vertical, or use auto?
3. Do I need the GA4 property ID before running?
4. Does this look like a composite vertical?
5. Anything to check in VWO before the audit?
6. Any prep needed first?

Then give me the exact command to paste into Claude Code.
```
