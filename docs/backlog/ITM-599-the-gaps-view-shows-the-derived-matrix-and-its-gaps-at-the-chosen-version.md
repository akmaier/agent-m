---
id: ITM-599
title: The gaps view shows the derived matrix and its gaps at the chosen version
level: module
realises:
  - UC-020
modules:
  - MOD-trace-pages
builds_on:
  - ITM-594
tests:
  - unit
  - component
  - system
  - release
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-599 The gaps view shows the derived matrix and its gaps at the chosen version

**REGISTER**

## Outcome

UC-020 steps 7, 7a and 7b. `coverageGaps` is built (ITM-308); the view is not.

## Acceptance

- The view shows the matrix and the gaps at the version shown.
- *Gaps* says when there are none.
- An older version shows what existed at its commit.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
