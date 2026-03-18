# Audit Tools
## Stage 3 Live QA — Automated Event Verification
Automates the "Could not test" amber events from the GTM verification report.
### What it tests
**Automatically (no interaction required):**
- page_view — fires with correct page_location and page_title
- scroll — fires at 90% depth
- view_item / view_item_list — fires on product/category page load
- GTM dataLayer presence
- VWO SmartCode presence and position
**Via configured selectors (add to client config.json):**
- Any click/interaction event where a CSS selector can target the trigger element
**Flagged as manual-only (cannot automate):**
- purchase / booking_completed — requires a real transaction
- form_submit on multi-step forms with validation
- Any event behind a login wall
### How to run
```bash
# Single client audit
node tools/audit/stage3-qa.js --client powerleague --url https://www.powerleague.com/football-birthday-party
# Via GitHub Actions (manual dispatch)
# Go to Actions → Stage 3 Live QA Audit → Run workflow
# Enter client name and URL
```
### Adding selectors for a client
In `clients/[client]/config.json`, add a `qa_selectors` object mapping action names to CSS selectors:
```json
{
  "qa_selectors": {
    "select_package": ".package-select-btn",
    "begin_checkout": ".checkout-cta",
    "open_date_picker": ".date-picker-trigger"
  }
}
```
The more selectors defined, the more interaction events can be tested automatically.
### Output files
- `clients/[client]/audit-stage3-[date].json` — full results with all parameters
- `clients/[client]/audit-stage3-[date].csv` — flat file matching audit log schema from brain/funnel-analysis.md
### Integration with the existing verification tool
This tool covers Stage 3 (Live QA). Stages 1 and 2 are covered by the existing automated verification workflow that produces the XLSX report. Together they cover the full 4-stage process:
| Stage | Tool | Output |
|---|---|---|
| 1 — Workspace | Existing verification workflow | XLSX (Workspace tab) |
| 2 — Post-publish | Existing verification workflow | XLSX (Live tab) |
| 3 — Live QA | This tool (stage3-qa.js) | JSON + CSV |
| 4 — Ongoing | Scheduled GitHub Action (weekly) | JSON + CSV committed to repo |
### Known failure patterns checked
The auditor automatically checks for:
- Parameters with value "undefined" (DLV name mismatch)
- Null parameters on required fields
- Value sent as string instead of number (breaks revenue tracking)
- Empty items[] array on ecommerce events
- Items array missing required fields (item_id, item_name, price, quantity)
- Currency missing on revenue events
- Duplicate event firing (>1 fire for single action)
- transaction_id missing on purchase event
