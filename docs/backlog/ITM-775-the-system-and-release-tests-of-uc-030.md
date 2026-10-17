---
id: ITM-775
title: The system and release tests of UC-030
level: system
realises:
  - UC-030
modules:
  - MOD-trace-pages
  - MOD-release-evidence
builds_on:
  - ITM-770
  - ITM-765
tests:
  - system
  - release
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-775 The system and release tests of UC-030

**REGISTER**

## Outcome

UC-030 checked as a whole through `trace/audit` on a fixture product at a release tag: the summary, the rows, the
filters, *Export* and *Commit export*, and the alternative flows 1a, 2a to 2d and 5a. Release tests, one or more for each
requirement UC-030 realises, among them `tests/test_audit_view.py`, which SPEC.md names for `THE AUDIT VIEW LISTS EVERY
REQUIREMENT OF THE RELEASE` and the repository lacks, with its cases in a Markdown data file beside it.

## Acceptance

- Every requirement UC-030 realises has a release test, and the system test walks the main flow and each alternative flow
  named; each test states its input, precondition and expected result where they can be read without running it, and
  names what it guards.
- It is written by a Developer who implemented none of the items it builds on (`RELEASE TESTS ARE NOT WRITTEN BY THE
  IMPLEMENTER`); each new test's counter-proof — a fault planted in the code it guards, and the test failing on it — is
  recorded in the pull request, which names the author.
- Where the page or a module and UC-030 disagree, the test follows UC-030 and the disagreement is named as a finding.
- Only new test files change.
