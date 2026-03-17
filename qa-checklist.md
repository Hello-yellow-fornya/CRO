# QA Checklist — Pre-Launch

Run this checklist against every variation before it goes live in VWO. No test launches without a full pass.

---

## Test Details

| Field | Value |
|---|---|
| Client | |
| Test ID | |
| Test size | BIG / MEDIUM / SMALL |
| Page URL | |
| VWO test ID | |
| QA date | |
| QA passed by | |

---

## 1. Code Quality

- [ ] Variation code executes without console errors
- [ ] No `console.log` statements left in production code
- [ ] Code is wrapped in VWO's execution wrapper (not bare JS)
- [ ] CSS is scoped to avoid unintended global style bleed
- [ ] No hardcoded pixel values that could break on different screen sizes
- [ ] All selectors tested against live DOM — confirm they resolve correctly
- [ ] Code handles elements that may not exist on page (null checks)
- [ ] No conflicts with existing jQuery version or other JS libraries on page

---

## 2. Anti-Flicker

- [ ] VWO anti-flicker snippet is present in `<head>` before other scripts
- [ ] Variation renders before page paint (no visible flash of original content)
- [ ] Test on slow 3G throttling in Chrome DevTools — no flicker visible
- [ ] If using `DOMContentLoaded` or `window.load` — confirm timing is correct

---

## 3. Visual — Desktop

- [ ] Variation renders correctly at 1440px width
- [ ] Variation renders correctly at 1280px width
- [ ] Variation renders correctly at 1024px width
- [ ] Fonts match client context file spec
- [ ] Colours match client context file spec
- [ ] Spacing and alignment consistent with site design system
- [ ] All images load correctly (no broken image paths)
- [ ] Hover states work correctly on interactive elements
- [ ] No text overflow or layout breaking at any tested width

---

## 4. Visual — Mobile

- [ ] Variation renders correctly at 375px (iPhone SE)
- [ ] Variation renders correctly at 390px (iPhone 14)
- [ ] Variation renders correctly at 414px (large Android)
- [ ] All CTAs are thumb-accessible (minimum 44px tap target)
- [ ] No horizontal scroll introduced
- [ ] Text is readable without zooming (minimum 16px body text)
- [ ] Images scale correctly — no overflow
- [ ] Sticky elements (if any) don't obscure content

---

## 5. Cross-Browser

- [ ] Chrome (latest) — desktop
- [ ] Safari (latest) — desktop
- [ ] Firefox (latest) — desktop
- [ ] Chrome — mobile (Android)
- [ ] Safari — mobile (iOS)

---

## 6. Functional

- [ ] All CTAs in variation are clickable and go to correct destination
- [ ] All form fields (if modified) accept input correctly
- [ ] Form validation still works correctly
- [ ] Any new interactive elements (accordions, tabs, pickers) function correctly
- [ ] Booking/conversion flow still completes end-to-end from variation
- [ ] Back button behaviour is correct
- [ ] No infinite loops or performance issues (check Memory tab in DevTools)

---

## 7. Analytics & Tracking

- [ ] VWO goal is configured and fires on correct conversion event
- [ ] GA4 custom event fires correctly when conversion occurs
- [ ] VWO variation is correctly labelled (not "Variation 1" — use descriptive name)
- [ ] Test is set to correct traffic split (default: 50/50)
- [ ] Test targeting rules are correct (URL match, device, audience if applicable)
- [ ] Exclude internal IP addresses from test traffic
- [ ] Test is in PAUSED state — not running — until final approval

---

## 8. Hypothesis & Test Config

- [ ] Hypothesis is documented in test database entry
- [ ] Primary metric is defined and trackable
- [ ] Secondary metrics are defined
- [ ] Minimum test duration has been calculated (see scoring model)
- [ ] Test size (BIG/MEDIUM/SMALL) is correctly classified
- [ ] Portfolio balance checked — not exceeding limits per client

---

## 9. Client Sign-Off (BIG and MEDIUM tests only)

- [ ] HTML mockup reviewed and approved by client
- [ ] Any copy changes approved by client
- [ ] No off-limits elements modified (check `/clients/[client]/off-limits.md`)
- [ ] Legal/compliance review complete if required (especially financial services clients)

---

## 10. Pre-Launch Final Check

- [ ] VWO test set to correct start date
- [ ] Screenshot of control taken and saved to `/clients/[client]/tests/[test-id]/`
- [ ] Test brief saved to `/clients/[client]/tests/[test-id]/brief.md`
- [ ] Variation code saved to `/clients/[client]/tests/[test-id]/variation.js`
- [ ] Test database entry created in `/test-database/index.md`

---

## Sign-Off

| | |
|---|---|
| QA passed | YES / NO |
| Blockers | |
| Notes | |
| Approved to launch | YES / NO |
