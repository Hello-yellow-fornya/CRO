# QA Checklist — Pre-Launch

Run this against every variation before it goes live in VWO. No test launches without a full pass.

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

---

## 1. Code Quality

- [ ] No console errors
- [ ] No console.log statements left in code
- [ ] Code wrapped in VWO execution wrapper
- [ ] CSS scoped — no global style bleed
- [ ] All selectors resolve correctly against live DOM
- [ ] Null checks on elements that may not exist
- [ ] No conflicts with existing jQuery or JS libraries

---

## 2. Anti-Flicker

- [ ] VWO anti-flicker snippet present in head before other scripts
- [ ] No visible flash of original content on load
- [ ] Tested on slow 3G throttling — no flicker

---

## 3. Visual — Desktop

- [ ] Renders correctly at 1440px
- [ ] Renders correctly at 1280px
- [ ] Renders correctly at 1024px
- [ ] Fonts match client context file
- [ ] Colours match client context file
- [ ] No text overflow or layout breaking

---

## 4. Visual — Mobile

- [ ] Renders correctly at 375px (iPhone SE)
- [ ] Renders correctly at 390px (iPhone 14)
- [ ] Renders correctly at 414px (large Android)
- [ ] All CTAs minimum 44px tap target
- [ ] No horizontal scroll introduced
- [ ] Body text minimum 16px

---

## 5. Cross-Browser

- [ ] Chrome desktop
- [ ] Safari desktop
- [ ] Firefox desktop
- [ ] Chrome mobile
- [ ] Safari mobile (iOS)

---

## 6. Functional

- [ ] All CTAs clickable and go to correct destination
- [ ] Form fields accept input correctly
- [ ] Form validation works
- [ ] Booking/conversion flow completes end-to-end
- [ ] No infinite loops or performance issues

---

## 7. Analytics & Tracking

- [ ] VWO goal configured and fires on correct event
- [ ] GA4 event fires correctly on conversion
- [ ] VWO variation descriptively labelled
- [ ] Correct traffic split set (default 50/50)
- [ ] Correct targeting rules set
- [ ] Internal IPs excluded
- [ ] Test in PAUSED state until final approval

---

## 8. Hypothesis & Config

- [ ] Hypothesis documented in test database
- [ ] Primary metric defined and trackable
- [ ] Secondary metrics defined
- [ ] Minimum duration calculated
- [ ] Test size correctly classified (BIG/MEDIUM/SMALL)
- [ ] Portfolio balance checked

---

## 9. Client Sign-Off (BIG and MEDIUM only)

- [ ] HTML mockup reviewed and approved
- [ ] Copy changes approved
- [ ] No off-limits elements modified
- [ ] Legal/compliance review complete if required

---

## 10. Pre-Launch Final Check

- [ ] Screenshot of control saved to /clients/[client]/tests/[test-id]/
- [ ] Brief saved to /clients/[client]/tests/[test-id]/brief.md
- [ ] Variation code saved to /clients/[client]/tests/[test-id]/variation.js
- [ ] Test database entry created in /test-database/index.md

---

## Sign-Off

| | |
|---|---|
| QA passed | YES / NO |
| Blockers | |
| Approved to launch | YES / NO |
