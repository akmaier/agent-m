---
id: ITM-1207
title: The schedule page's table fits a phone
level: module
realises:
  - EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
  - UC-027
modules:
  - MOD-test-pages
builds_on:
  - ITM-1206
tests:
  - unit
origin:
  - the usability check of #1324 (ITM-1206), which draws `#schedule` for the first time on the live page
---
# ITM-1207 The schedule page's table fits a phone

**REGISTER**

## Outcome

On a 390 px phone, `#schedule`'s `table.levels` is 557 px wide, wider than the window; `tests/site-usability.test.mjs`
holds it as a todo. MOD-site-frame's `look.css` gives every table its narrow form below 600 px when the route sets
`data-label` on each cell and no style of its own (MOD-site-frame.md, `look.css`). The schedule's table takes that form.

## Acceptance

- The todo in `tests/site-usability.test.mjs` for `#schedule` is removed, and the check passes on a 390 px window.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-pages/` and the tests that name MOD-test-pages change.
