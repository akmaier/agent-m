---
id: ITM-1208
title: The runner choice of a schedule row has an accessible name
level: module
realises:
  - THE SITE SERVES A SCREEN READER
  - UC-027
modules:
  - MOD-test-pages
builds_on:
  - ITM-1206
tests:
  - unit
origin:
  - the accessibility check of #1324 (ITM-1206), which draws `#schedule` for the first time on the live page
---
# ITM-1208 The runner choice of a schedule row has an accessible name

**REGISTER**

## Outcome

The runner `<select>` of a row of `#schedule` has no accessible name (axe rule `select-name`);
`tests/site-accessibility.test.mjs` holds it as a todo. Each row's choice is named by its level and occasion.

## Acceptance

- The todo in `tests/site-accessibility.test.mjs` for `select-name` on `#schedule` is removed, and the check passes.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-pages/` and the tests that name MOD-test-pages change.
