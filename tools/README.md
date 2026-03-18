# CRO OS Tools

## extract-tokens.js
Extracts CSS design tokens from a live client page (fetch-based, no browser).
```
node tools/extract-tokens.js <url> <client-slug>
```
Output: `clients/[client]/design-tokens.md`

## extract-control.js
Renders a live client page in a headless browser and saves it as a self-contained control.html.
```
node tools/extract-control.js --client <slug> --url <url> [--viewport desktop|mobile]
```
Output:
- `clients/[client]/controls/[page-slug].html` — standalone control file
- `clients/[client]/controls/[page-slug]-vwo-snapshot.json` — VWO test state at time of extraction
- `clients/[client]/controls/[page-slug]-meta.json` — extraction metadata

**Important:** If VWO is active on the page, the control will reflect the state seen by the renderer — which may be a variation, not the original. Always check the VWO snapshot before using the file as a test control. If a test is running, pause it in VWO first, then re-extract.

## Workflows (GitHub Actions)

| Workflow | Trigger | What it does |
|---|---|---|
| `extract-tokens.yml` | Push to `clients/**/config.json` or manual | Extracts CSS tokens |
| `extract-control.yml` | Manual dispatch | Renders page → control.html + VWO snapshot |
| `audit-stage3.yml` | Manual or weekly Monday 08:00 UTC | GA4 tag health check |
| `onboard-client.yml` | Manual dispatch | Full 6-phase new client onboarding |
| `generate-mockup.yml` | New `design-tokens.md` | Generates variation mockup |
| `generate-control.yml` | New `design-tokens.md` | Generates faithful control mockup |
