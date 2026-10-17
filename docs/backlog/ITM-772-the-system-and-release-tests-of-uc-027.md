---
id: ITM-772
title: The system and release tests of UC-027
level: system
realises:
  - UC-027
modules:
  - MOD-test-pages
  - MOD-test-schedule
builds_on:
  - ITM-759
  - ITM-747
  - ITM-476
tests:
  - system
  - release
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-772 The system and release tests of UC-027

**REGISTER**

## Outcome

UC-027 checked as a whole through the page `schedule`, on a fixture GitHub and a fixture GitLab server: the default
shown, cells changed and refused, runners and secrets named, *Save* opening one pull request, *Merge* once green, the
GitLab pipeline schedule set, the drift of a hand-edited configuration, and a missed nightly run. Release tests, one or
more for each requirement UC-027 realises that has no release test yet; `tests/test_ci_schedule.py`, which SPEC.md names
for four of them, is ITM-476's and is extended here only for what ITM-476 does not cover.

## Acceptance

- Every requirement UC-027 realises has a release test, and the system test walks the main flow and each alternative flow
  named; each test states its input, precondition and expected result where they can be read without running it, and
  names what it guards.
- It is written by a Developer who implemented none of the items it builds on (`RELEASE TESTS ARE NOT WRITTEN BY THE
  IMPLEMENTER`); each new test's counter-proof — a fault planted in the code it guards, and the test failing on it — is
  recorded in the pull request, which names the author.
- Where the page or a module and UC-027 disagree, the test follows UC-027 and the disagreement is named as a finding.
- Only new test files change.
