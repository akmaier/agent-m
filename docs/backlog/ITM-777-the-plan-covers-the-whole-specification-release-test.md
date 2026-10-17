---
id: ITM-777
title: The release test that a plan covers the whole specification
level: system
realises:
  - UC-031
  - UC-035
  - A PLAN COVERS THE WHOLE SPECIFICATION
modules:
  - MOD-model-catalogue
builds_on:
tests:
  - release
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-777 The release test that a plan covers the whole specification

**REGISTER**

## Outcome

`tests/test_plan_coverage.py`, the check SPEC.md names for `A PLAN COVERS THE WHOLE SPECIFICATION`, does not exist.
MOD-model-catalogue's `planGrid` is built (`src/model-catalogue/plan.mjs`). The test runs it on a fixture of N accepted
requirements and the shipped V-model of P phases.

## Acceptance

- The derived plan has exactly N × P entries, each requirement once in each phase, and the count reads as UC-031 step 5
  shows it; one more accepted requirement adds P entries; no requirement gives the phases empty; a pulled model is
  refused with `NotPlanned`.
- Each test names the requirement it guards, the module it exercises and its level `release`; its cases stand in a
  Markdown data file beside it, and the Python file only loads them (AGENTS.md §7).
- It is written by a participant who implemented none of the behaviour it tests; each test's counter-proof is recorded
  in the pull request.
- Only the new test file and its data file change.
