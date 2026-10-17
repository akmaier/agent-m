---
id: ITM-791
title: CI resumes a job whose gate is recorded
level: module
realises:
  - UC-034
  - A JOB STOPS AT EVERY GATE
  - A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS
modules:
  - MOD-workflow-entries
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-791 CI resumes a job whose gate is recorded

**REGISTER**

## Outcome

UC-034 step 7 on the CI route. `onRecordsChanged` takes queued jobs, and resuming after a gate is left to another item
(`src/workflow-entries/product.mjs:3`). This item adds what MOD-workflow-entries' file states: on a push to
`docs/gates/`, each job of this route whose gate is now passed by `gateStates` is resumed; a record by the participant
whose work the gate checks leaves it waiting.

## Acceptance

- A job of the CI route waiting at a gate goes on after a valid gate record is pushed, and stays waiting on its own
  implementer's record or on none.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
