---
id: ITM-586
title: A queued run-tests job runs its levels on its commit and appends the run's result record
level: module
realises:
  - UC-013
modules:
  - MOD-result-records
builds_on:
  - ITM-476
tests:
  - unit
  - component
  - system
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-586 A queued run-tests job runs its levels on its commit and appends the run's result record

**REGISTER**

## Outcome

UC-013 step 2: "starts the complete test suite at every level on exactly that commit", and its second postcondition.
- `resultStrategies` — the recipe `commit-and-levels` and the writer `result-record` — is not built (`src/result-records/index.mjs:3-5`).
- `commit-and-levels` is registered nowhere.
- It shares `appendResult` with ITM-476, so it builds on that item.

## Acceptance

- A release candidate's `run-tests` job runs the named levels on that commit and appends its result record.
- The release panel reads that record.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
