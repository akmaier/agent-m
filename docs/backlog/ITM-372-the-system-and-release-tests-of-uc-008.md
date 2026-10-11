---
id: ITM-372
title: The system and release tests of UC-008
level: system
realises:
  - UC-008
modules:
  - MOD-review-pages
  - MOD-approvals
builds_on:
  - ITM-355
  - ITM-356
  - ITM-358
  - ITM-368
tests:
  - system
  - release
origin:
  - UC-008
---
# ITM-372 The system and release tests of UC-008

**REGISTER**

## Outcome

UC-008 checked as a whole through the review pages, once ITM-355, ITM-356 and ITM-358 and the change between jobs after
them are merged: a system test that walks the main flow and each alternative flow — 1a, 2a, 3a, 3b, 3c, 3d, 3e, 4a and
5a — with GitHub and the GitLab server replaced by fixture servers; and release tests, one or more for each requirement
UC-008 realises. The tests are written by a Developer who implemented none of ITM-333, ITM-334, ITM-342, ITM-355,
ITM-356 and ITM-358 (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`). `tests/dashboard-review-flows.test.mjs` walks
the old dashboard's flows and stays.

## Acceptance

- Every requirement UC-008 realises has a release test, and the system test walks the main flow and each alternative
  flow; each test states its input, precondition and expected result where they can be read without running it, and
  names what it guards.
- Each new test's counter-proof — a fault planted in the code it guards, and the test failing on it — is recorded in
  the pull request, which names the author.
- Where the dashboard and UC-008 disagree, the test follows UC-008 and the disagreement is named as a finding.
- Only new test files change.
