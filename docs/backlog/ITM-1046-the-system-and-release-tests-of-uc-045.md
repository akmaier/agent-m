---
id: ITM-1046
title: The system and release tests of UC-045
level: system
realises:
  - UC-045
modules:
  - MOD-implementation-pages
  - MOD-work-plans
builds_on:
  - ITM-1043
  - ITM-1044
tests:
  - system
  - release
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-045-6, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1046 The system and release tests of UC-045

**REGISTER**

## Outcome

No test of level `release` names UC-045, and `tests/` holds neither `tests/test_implementation_plan.py` — the check SPEC.md
names for `AN IMPLEMENTATION PLAN ASSEMBLES THE SYSTEM FROM ITS MODULES` and `A PLAN STEP NAMES THE TESTS OF ITS LEVEL` — nor
`tests/test_plan_layout.py`, the check of `THE IMPLEMENTATION PLAN LIVES IN THE PRODUCT REPOSITORY`. The system test walks
UC-045's main flow and alternative flows as the dashboard reaches them. They are written by a participant who implements
none of the items they test (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- Every requirement UC-045 realises has a release test; each new test's counter-proof is recorded in the pull request.
- Where the page and UC-045 disagree, the test follows UC-045 and the disagreement is named as a finding.
- Only tests change.
