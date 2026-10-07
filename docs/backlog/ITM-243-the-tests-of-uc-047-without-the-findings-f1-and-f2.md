---
id: ITM-243
title: The tests of UC-047 without the findings F1 and F2
level: system
realises:
  - UC-047
modules:
  - MOD-notifications
  - MOD-progress-measures
builds_on:
  - ITM-238
tests:
  - system
  - release
origin:
  - UC-047
---
# ITM-243 The tests of UC-047 without the findings F1 and F2

**REGISTER**

## Outcome

ITM-238's system and release tests of UC-047 without the findings F1 and F2, once the change between jobs that settles
them is merged: the dashboard's settings page shows the line *Notifications* in the section *This browser*, beside the box
of its other lines; and its review and main pages hand MOD-notifications the instance as the dashboard connects it, with
the token the dashboard keeps for it, as `docs/assets/dashboard/process-view.mjs` does (UC-047 steps 1 and 2). The todo
marks of ITM-238's tests of F1 and F2 are removed, by a Developer who implemented none of UC-047 nor that change
(`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- The tests of F1 and F2 pass on the sprint's branch with no todo mark.
- Each of them has its counter-proof recorded in the pull request: a fault planted in the code it guards, and the test
  failing on it.
- Only ITM-238's two test files change: `tests/system-uc-047-be-told-what-waits-for-your-acceptance.test.mjs` and
  `tests/release-sprint-07-uc-047-notifications.test.mjs`.
