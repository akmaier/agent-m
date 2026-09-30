---
id: MOD-test-records
title: Writes and reads test result records and derives outcomes, flaky tests and rates per commit
realises:
  - EVERY TEST RUN LEAVES A RESULT RECORD
  - TEST RESULTS ARE KEPT IN THE REPOSITORY
  - A RESULT RECORD IS NEVER REWRITTEN
  - A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
  - A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
  - EVERY TEST HAS ONE LEVEL
  - A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
  - A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT
  - RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER
  - UC-026
  - UC-028
  - UC-029
follows:
  - ARC-003
  - ARC-006
  - ARC-015
  - ARC-016
uses: []
provides:
  - resultRecord
  - fromJUnit
  - parseResultRecord
  - commitOutcomes
  - rateComparison
  - batteryProblems
---
# MOD-test-records Writes and reads test result records and derives outcomes, flaky tests and rates per commit

## Responsibility

Test evidence: the result records on the append-only branch `test-results`, the outcomes and flaky
tests derived from them per commit, rates against the last release, and the checks a generated test
battery must pass. Pure core.

**Current state.** No code exists.

## Interfaces

- `resultRecord({ commit, levels, participant, date, outcomes, uncommittedChanges }) -> { path, text }` — `results/<commit>/<run>.md` on the branch `test-results`.
- `fromJUnit(xml, declarations) -> outcomes` — the CI step's conversion of a runner's JUnit XML, joined with each test's `TST-` identifier and level.
- `parseResultRecord(text) -> record`. — 
- `commitOutcomes(records, commit) -> { byLevel, byTest, notRun }` — per test passed, failed or flaky (both outcomes on one commit), per level *not run on this commit* where no record exists; model-dependent tests as a rate over the fixed number of runs.
- `rateComparison(current, lastRelease) -> { rate, previous, worse }` — the release question "is this worse than what runs", never a threshold on one run.
- `batteryProblems(tests, jobRecords) -> [finding]` — a test without expected result, level or guarded identifier, a model-dependent test judged on one run, a commit-level test calling a paid service, a new test without counter-proof, a release test written by the implementer.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
