---
id: ITM-1063
title: The system and release tests of UC-048
level: system
realises:
  - UC-048
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-1064
tests:
  - system
  - release
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-048-1, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1063 The system and release tests of UC-048

**REGISTER**

## Outcome

No item realises UC-048, and `tests/` holds no system test of it. UC-048.md:49-60 is the main flow, :84-100 the
alternative flows; MOD-implementation-pages.md:147-152 the route that serves them ("`roles` — *Roles* (UC-048): the
product's role assignments — its teams, in a model with sprints —, each with who fills which role, and the roles of the
model with what each needs and how many fill it").

The system test walks the main flow and every alternative flow UC-048 names, as the dashboard reaches `#roles`, each test
stating its expected result; 2a and 4b run with two teams. The existing `tests/test_role_assignment.py`,
`tests/test_model_roles.py` and `tests/test_participants.py` stay; a release test is added for each requirement UC-048
realises without one, except those whose check is "at review". They are written from UC-048 and the requirements it
realises by a participant who implements none of the items it tests (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- Every requirement UC-048 realises with an automatic check has a release test, existing or new; each new test's
  counter-proof is recorded in the pull request.
- Where the page and UC-048 disagree, the test follows UC-048 and the disagreement is named as a finding.
- Only tests change.
