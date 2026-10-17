---
id: ITM-654
title: A fix shows each changed expectation, old beside new
level: module
realises:
  - UC-012
modules:
  - MOD-maintenance-pages
builds_on:
tests:
  - unit
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), whose row was blocked on a draft that akmaier accepted in b43da779
---
# ITM-654 A fix shows each changed expectation, old beside new

**REGISTER**

## Outcome

UC-012 5a: "the author sees the old and the new expectation side by side". MOD-maintenance-pages' `issues` route
(accepted text): "before its pull request is merged, for each existing test whose expected result the fix changes, the
requirement it now checks correctly with the old and the new expectation side by side". The interfaces it reads, and
whether its path reads the repository per test, are read at its start (sprint 66's agreement).

## Acceptance

- Before a fix's pull request is merged, each existing test whose expected result it changes is shown with its requirement, the old and the new expectation side by side.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
