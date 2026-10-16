---
id: ITM-580
title: The system and release tests of UC-007
level: system
realises:
  - UC-007
modules:
  - MOD-review-pages
  - MOD-artifact-edits
  - MOD-job-runner
builds_on:
tests:
  - system
  - release
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-580 The system and release tests of UC-007

**REGISTER**

## Outcome

UC-007 has no system test and no release test.

## Acceptance

- The system test walks the main flow and every alternative.
- Every requirement UC-007 realises has a release test, written by a developer who implemented none of it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
