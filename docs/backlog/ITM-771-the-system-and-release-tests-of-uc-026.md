---
id: ITM-771
title: The system and release tests of UC-026
level: system
realises:
  - UC-026
modules:
  - MOD-test-pages
  - MOD-result-records
builds_on:
  - ITM-764
  - ITM-755
tests:
  - system
  - release
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-771 The system and release tests of UC-026

**REGISTER**

## Outcome

UC-026 checked as a whole through the page `generate`: proposing, reviewing and writing tests on a fixture product, with
a fixture participant that returns a proposal and writes tests with their counter-proofs. Release tests, one or more for
each requirement UC-026 realises, among them the checks SPEC.md names and the repository lacks:
`tests/test_test_generation_context.py` (`TEST GENERATION SEES THE EXISTING TESTS`) and `tests/test_counter_proof.py`
(`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`), each with its cases in a Markdown data file beside it (AGENTS.md §7).

## Acceptance

- Every requirement UC-026 realises has a release test, and the system test walks the main flow and each alternative flow
  named; each test states its input, precondition and expected result where they can be read without running it, and
  names what it guards.
- It is written by a Developer who implemented none of the items it builds on (`RELEASE TESTS ARE NOT WRITTEN BY THE
  IMPLEMENTER`); each new test's counter-proof — a fault planted in the code it guards, and the test failing on it — is
  recorded in the pull request, which names the author.
- Where the page or a module and UC-026 disagree, the test follows UC-026 and the disagreement is named as a finding.
- Only new test files change.
