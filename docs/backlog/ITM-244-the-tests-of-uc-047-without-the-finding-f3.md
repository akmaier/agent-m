---
id: ITM-244
title: The tests of UC-047 without the finding F3
level: system
realises:
  - UC-047
  - A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
modules:
  - MOD-notifications
  - MOD-progress-measures
builds_on:
  - ITM-207
  - ITM-238
tests:
  - system
  - release
origin:
  - UC-047
---
# ITM-244 The tests of UC-047 without the finding F3

**REGISTER**

## Outcome

ITM-238's system and release tests of UC-047 without the finding F3, once ITM-207 and the change between jobs after it are
merged: the dashboard keeps its product list and the products' tokens through MOD-browser-store, so that UC-047's checks
reach each product this browser keeps, each with its own token (UC-047 step 2). The todo marks of ITM-238's tests of F3
are removed, and their fixtures give the products where MOD-browser-store keeps them, by a Developer who implemented none
of UC-047 nor that change (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- The tests of F3 pass on the sprint's branch with no todo mark.
- Each of them has its counter-proof recorded in the pull request: a fault planted in the code it guards, and the test
  failing on it.
- Only ITM-238's two test files change: `tests/system-uc-047-be-told-what-waits-for-your-acceptance.test.mjs` and
  `tests/release-sprint-07-uc-047-notifications.test.mjs`.
