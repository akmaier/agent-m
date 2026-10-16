---
id: ITM-589
title: MOD-source-register gives affectedRequirements and changedPassages
level: module
realises:
  - UC-015
  - UC-016
modules:
  - MOD-source-register
builds_on:
tests:
  - unit
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-589 MOD-source-register gives affectedRequirements and changedPassages

**REGISTER**

## Outcome

UC-015 2b: "lists the product's requirements that name this source before saving"; UC-016 step 4: "which passages changed". Both functions are in MOD-source-register's `provides:`, and neither has code.

## Acceptance

- `affectedRequirements(spec, source)` and `changedPassages(before, after)` work as the module file states them, each with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
