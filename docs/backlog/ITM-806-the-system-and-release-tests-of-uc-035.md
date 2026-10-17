---
id: ITM-806
title: The system and release tests of UC-035
level: system
realises:
  - UC-035
modules:
  - MOD-implementation-pages
  - MOD-progress-measures
builds_on:
  - ITM-800
tests:
  - system
  - release
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-806 The system and release tests of UC-035

**REGISTER**

## Outcome

No item realises the system and release tests of UC-035, and `tests/` holds no system test of it. The system test walks
the main flow and every alternative flow UC-035 names, as the dashboard reaches it, each test stating its expected result.
Its release tests include `tests/test_progress_view.py`, the check SPEC.md names for `PROGRESS IS SHOWN IN THE MODEL'S OWN MEASURE`, which does not exist: a V-model, a Scrum and a Kanban fixture each render their declared measure.
They are written from UC-035 and the requirements it realises by a participant who implements none of the items it
tests (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- Every requirement UC-035 realises has a release test; each new test's counter-proof is recorded in the pull request.
- Where the page and UC-035 disagree, the test follows UC-035 and the disagreement is named as a finding.
- Only tests change.
