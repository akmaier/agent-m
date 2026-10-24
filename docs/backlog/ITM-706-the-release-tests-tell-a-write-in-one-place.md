---
id: ITM-706
title: The release tests tell a write in one place
level: system
realises:
  - A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
modules:
  - MOD-site-frame
builds_on:
  - ITM-678
  - ITM-574
  - ITM-687
tests:
  - release
origin:
  - ITM-678's pull request #725, from developer-sonnet-b's finding
---
# ITM-706 The release tests tell a write in one place

**REGISTER**

## Outcome

`const writes = …`, the rule that tells which of a fake server's requests is a write, stands copied in three release
files (a fourth, `tests/release-sprint-14-spec-overview-readonly.test.mjs`, was removed by `a6c56a46`):
- `tests/release-sprint-15-spec-toggles.test.mjs`;
- `tests/release-sprint-02-d-dashboard-app.test.mjs`;
- `tests/release-sprint-02-d-settings-store.test.mjs`.

ITM-678 had to teach two of them that the batch `POST …/graphql` is a read. A copy left untaught would count it as a
write. Sprint 56's agreement reads: "A shared test harness lives in a helper file of its own, never in a test file."
So the rule moves into `tests/app-harness.mjs`, MOD-site-frame's since ITM-574, and the four files use it.

It is written by a participant who builds none of ITM-574, since the files are release tests.

## Acceptance

- One function of `tests/app-harness.mjs` tells a write. The three files use it, and none keeps a copy.
- Their expected results are unchanged, and each passes on the base and on ITM-574's head.
- Its counter-proof: a planted write in a page fails each of them.

**It waits for ITM-574 and ITM-687** (sprint team1/72, ITM-707's pull request). `tests/app-harness.mjs` and
`tests/release-sprint-02-d-dashboard-app.test.mjs` belong to no module until ITM-574 moves them into MOD-site-frame.
`tests/release-sprint-02-d-settings-store.test.mjs` belongs to none until ITM-687 moves it into MOD-browser-store.
`CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT` lets only the moving job change such a file.
