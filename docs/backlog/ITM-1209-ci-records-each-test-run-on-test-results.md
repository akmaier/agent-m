---
id: ITM-1209
title: CI records each test run on test-results (onTestsFinished)
level: module
realises:
  - EVERY TEST RUN LEAVES A RESULT RECORD
  - TEST RESULTS ARE KEPT IN THE REPOSITORY
  - A RESULT RECORD IS NEVER REWRITTEN
  - UC-028
modules:
  - MOD-workflow-entries
builds_on:
  - ITM-635
  - ITM-744
  - ITM-750
tests:
  - unit
origin:
  - ITM-476, split on akmaier's request of 2026-10-25 to get the test pages working; the analysis of ITM-476 against main at cd6b00ff
---
# ITM-1209 CI records each test run on test-results (onTestsFinished)

**REGISTER**

## Outcome

MOD-workflow-entries' entry `onTestsFinished` (MOD-workflow-entries.md, Interfaces), which the generated test
configuration already calls after each run's tests (`src/test-schedule/templates/github-job.yml:20`). Today
`src/workflow-entries/main.mjs` names no such entry, so the step would fail with "There is no entry".

It reads the run's JUnit XML report with MOD-result-records' `parseOutcomes`, matched to the test declarations, and adds
the run's record with `appendResult` to the branch `test-results`; on `Moved` it reads the branch again and adds again; a
record that cannot be added ends the entry with `failed`. A level that did not run is not recorded as passed. Both
interfaces are used unchanged.

The records the runs page shows are then written by CI, not by hand, which is what the page reads precomputed in its load.

## Acceptance

- Unit tests naming MOD-workflow-entries, over a fake host and a JUnit fixture: one record per run with its commit,
  levels, occasion, runner, date, run address and outcomes; a level not run is not passed; `Moved` adds again; a record
  that cannot be added ends `failed`; a missing report or secret ends the entry before anything is written.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/workflow-entries/` and the tests that name MOD-workflow-entries change; the code stays in the files
  MOD-workflow-entries' Parts name.
