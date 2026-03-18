# QA Checklist — Pre-Launch

Run this against every variation before it goes live in VWO.

## Test Details

| Field | Value |
|---|---|
| Client | |
| Test ID | |
| Test size | BIG / MEDIUM / SMALL |
| Page URL | |
| VWO test ID | |
| QA date | |

## 1. Code Quality
- [ ] No console errors
- [ ] No console.log statements
- [ ] Code wrapped in VWO execution wrapper
- [ ] CSS scoped — no global style bleed
- [ ] All selectors resolve against live DOM
- [ ] Null checks on elements that may not exist
- [ ] No conflicts with existing JS libraries

## 2. Anti-Flicker
- [ ] VWO anti-flicker snippet in head before other scripts
- [ ] No flash of original content on load
- [ ] Tested on slow 3G — no flicker

## 3. Visual — Desktop
- [ ] Renders at 1440px, 1280px, 1024px
- [ ] Fonts match client context file
- [ ] Colours match client context file
- [ ] No text overflow or layout breaking

## 4. Visual — Mobile
- [ ] Renders at 375px, 390px, 414px
- [ ] CTAs minimum 44px tap target
- [ ] No horizontal scroll
- [ ] Body text minimum 16px

## 5. Cross-Browser
- [ ] Chrome, Safari, Firefox desktop
- [ ] Chrome, Safari mobile

## 6. Functional
- [ ] All CTAs go to correct destination
- [ ] Form validation works
- [ ] Booking/conversion flow completes end-to-end

## 7. Analytics
- [ ] VWO goal fires on correct event
- [ ] GA4 event fires on conversion
- [ ] Internal IPs excluded
- [ ] Test in PAUSED state until approval

## 8. Pre-Launch
- [ ] Brief saved to /clients/[client]/tests/[id]/brief.md
- [ ] Variation code saved to /clients/[client]/tests/[id]/variation.js
- [ ] Test database entry created

## Sign-Off

| | |
|---|---|
| QA passed | YES / NO |
| Approved to launch | YES / NO |
