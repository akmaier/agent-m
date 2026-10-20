---
id: ITM-1106
title: The maintenance pages' "Close and reply" test holds under load
level: unit
realises:
  - UC-039
modules:
  - MOD-maintenance-pages
builds_on:
  - ITM-968
tests:
  - unit
origin:
  - CI of #1140, sprint team2/97, on main at 02645811 (agreement 94)
---
# ITM-1106 The maintenance pages' "Close and reply" test holds under load

**REGISTER**

## Outcome

`tests/maintenance-pages-ask.test.mjs`, "Close and reply closes the open issue and shows its drafts" (ITM-968), failed on #1140's
first CI attempt and passed on the rerun, on the same commit. It passes 4 of 4 locally, three times. A test that flips on the
same commit is flaky, and is fixed before either team works around it (agreement 94).

## Acceptance

- The cause is named in the pull request, as a data-flow path (AGENTS.md §2), with the run that showed it.
- The test waits for what it asserts, not for time. It passes 20 runs in a row under the CI's own concurrency, recorded in the
  pull request.
- Only the test, or the page's code where the cause lies there, changes.
