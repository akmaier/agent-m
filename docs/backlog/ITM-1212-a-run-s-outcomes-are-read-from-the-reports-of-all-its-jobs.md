---
id: ITM-1212
title: A run's outcomes are read from the reports of all its jobs, with a reason for a test not run
level: module
realises:
  - EVERY TEST RUN LEAVES A RESULT RECORD
  - A RESULT RECORD IS NEVER REWRITTEN
  - UC-027
  - UC-028
modules:
  - MOD-result-records
builds_on:
  - ITM-750
  - ITM-635
  - ITM-1209
tests:
  - unit
origin:
  - ITM-476, split after akmaier accepted MOD-result-records on 2026-10-26 (33f3ab1b)
---
# ITM-1212 A run's outcomes are read from the reports of all its jobs, with a reason for a test not run

**REGISTER**

## Outcome

MOD-result-records as accepted (MOD-result-records.md, Data and Interfaces):

- `parseOutcomes(reports: string[], declarations)` reads the JUnit XML reports of a run's jobs together as one: several
  cases of a deterministic test, in one report or several, pass only if all pass; a declared test without a case in any
  report is `not run`. `UnreadableReport { index, reason }` names the place of a report that is not one — a report cut
  off counts as one.
- `Outcome.reason`: `null` from `parseOutcomes`; written to the record's optional column `Reason`. A record of the four
  columns before it is valid, and every reader — `resultsAt`, `flakyTests`, `rateComparison`, `testHistory` — reads its
  tests with `reason: null`.

The one caller, `onTestsFinished` (`src/workflow-entries/product.mjs:590`), passes its one report as a list, so that the
signature change leaves it working; ITM-1216 then gives it all the run's reports.

## Acceptance

- Unit tests naming MOD-result-records: two reports read as one run; a test failing in one report and passing in the
  other is `failed`; a test in no report is `not run`; a cut-off second report gives `UnreadableReport` with index 1;
  a record with `Reason` round-trips; a four-column record reads with `reason: null` (the counter-case).
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/result-records/`, the one call in `src/workflow-entries/product.mjs` and the tests that name
  MOD-result-records change.
