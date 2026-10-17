---
id: ITM-750
title: A run's outcomes from its JUnit XML report
level: module
realises:
  - UC-028
  - EVERY TEST RUN LEAVES A RESULT RECORD
  - A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
  - EVERY TEST HAS ONE LEVEL
modules:
  - MOD-result-records
builds_on:
  - ITM-251
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
  - ITM-476's "remaining accepted report-parser prerequisite", separated from it as ITM-635 was
---
# ITM-750 A run's outcomes from its JUnit XML report

**REGISTER**

## Outcome

MOD-result-records' `parseOutcomes(report, declarations)`, in `junit.mjs`, as its file states it. Each case is
matched to its declaration by the `TST-<nnn>` at the start of its name. Its outcome is one of:
- **failed**: a failure or an error;
- **not run**: skipped;
- **passed**: any other case.

Several cases of a deterministic test pass only if all pass. A model-dependent test's cases are its runs, `<k> of <n>`,
and `not run` when fewer ran than it fixes. A case without an identifier is `undeclared`, and a declared test without
a case is `not run`. A text that is not a JUnit XML report gives `UnreadableReport`. ITM-476's `onTestsFinished`
consumes it unchanged.

## Acceptance

- On fixture reports from node's JUnit reporter and from pytest, the tests state each of the rules above. They also state
  a model-dependent test with 17 of 20 runs passed.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/result-records/` and the tests that name MOD-result-records change.
