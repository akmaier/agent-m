---
id: ITM-802
title: The system and release tests of UC-031
level: system
realises:
  - UC-031
modules:
  - MOD-implementation-pages
  - MOD-model-catalogue
builds_on:
  - ITM-778
  - ITM-779
  - ITM-780
  - ITM-776
  - ITM-777
tests:
  - system
  - release
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-802 The system and release tests of UC-031

**REGISTER**

## Outcome

No item realises the system and release tests of UC-031, and `tests/` holds no system test of it. The system test walks
the main flow and every alternative flow UC-031 names, as the dashboard reaches it, each test stating its expected result.
The release tests of `THE CATALOGUE IS DATA` and `A PLAN COVERS THE WHOLE SPECIFICATION` are ITM-776 and ITM-777, and the
existing `tests/test_model_validation.py` stays; a release test is added for each other requirement without one.
They are written from UC-031 and the requirements it realises by a participant who implements none of the items it
tests (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- Every requirement UC-031 realises has a release test; each new test's counter-proof is recorded in the pull request.
- Where the page and UC-031 disagree, the test follows UC-031 and the disagreement is named as a finding.
- Only tests change.
