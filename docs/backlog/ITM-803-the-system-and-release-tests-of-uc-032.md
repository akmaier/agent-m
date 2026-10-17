---
id: ITM-803
title: The system and release tests of UC-032
level: system
realises:
  - UC-032
modules:
  - MOD-implementation-pages
  - MOD-work-plans
builds_on:
  - ITM-681
  - ITM-782
  - ITM-783
  - ITM-784
tests:
  - system
  - release
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-803 The system and release tests of UC-032

**REGISTER**

## Outcome

No item realises the system and release tests of UC-032, and `tests/` holds no system test of it. The system test walks
the main flow and every alternative flow UC-032 names, as the dashboard reaches it, each test stating its expected result.
Steps 5, 6, 6c and 6d run with two teams' sprints. The existing release tests `tests/test_parallel_sprints.py`,
`tests/test_wip_limit.py`, `tests/test_time_box_selection.py` and `tests/test_job_from_backlog.py` stay; a release test is
added for each requirement UC-032 realises without one.
They are written from UC-032 and the requirements it realises by a participant who implements none of the items it
tests (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- Every requirement UC-032 realises has a release test, existing or new; each new test's counter-proof is recorded in the pull request.
- Where the page and UC-032 disagree, the test follows UC-032 and the disagreement is named as a finding.
- Only tests change.
