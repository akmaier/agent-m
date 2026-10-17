---
id: ITM-707
title: The dashboard's release tests reach the app through the harness
level: system
realises:
  - UC-006
  - UC-008
modules:
  - MOD-site-frame
  - MOD-settings-pages
builds_on:
tests:
  - release
origin:
  - ITM-574's stop before its tests-only commit (sprint team1/72), under sprint 68's agreement on release tests an item changes
---
# ITM-707 The dashboard's release tests reach the app through the harness

**REGISTER**

## Outcome

ITM-574 moves the live app from `docs/assets/dashboard-app.mjs` into `src/site-frame/`. These release tests name the old
path, and fail once it moves:
- `tests/release-sprint-01-dashboard-app.test.mjs`: UC-008 3 (:569) and UC-006 4a (:713). Its `writes()` counts the batch
  `POST …/graphql` as a write, so it leaves that address out, as ITM-678 does; the expected `[]` stays.
- `tests/release-sprint-02-a-dashboard-app.test.mjs`: ITM-126 (:488, :529), which imports and reads the old path.
- `tests/release-uc-003-direct-endpoint.test.mjs`: TST-292005 (:55), which imports `../docs/assets/dashboard-app.mjs?…`.
  Its header names MOD-settings-pages.

ITM-574's draft run traced these three. TST-292005 is in `release-uc-003`, not in `release-uc-019`.

They reach the app through `tests/app-harness.mjs` instead, which knows where the app is. They then pass on the base and
on ITM-574's head. Their expected results are unchanged. A participant who builds none of ITM-574 changes them, before
ITM-574's gate, in the pattern of ITM-645, ITM-664 and ITM-678.

## Acceptance

- Each named release test passes on `sprint/team1/72` as it stands and on ITM-574's draft, with no expected result
  changed.
- Its whole release file is run on both (sprint 70's agreement).
- It is written by a participant who builds none of ITM-574.
