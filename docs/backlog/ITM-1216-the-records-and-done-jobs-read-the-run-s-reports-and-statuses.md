---
id: ITM-1216
title: The records and done jobs read the run's reports and statuses
level: module
realises:
  - EVERY TEST RUN LEAVES A RESULT RECORD
  - A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS
  - UC-027
  - UC-028
modules:
  - MOD-workflow-entries
builds_on:
  - ITM-1209
  - ITM-1210
  - ITM-1212
  - ITM-1213
  - ITM-1215
tests:
  - unit
origin:
  - ITM-476, split after akmaier accepted MOD-workflow-entries on 2026-10-26 (33f3ab1b)
---
# ITM-1216 The records and done jobs read the run's reports and statuses

**REGISTER**

## Outcome

`onTestsFinished` and `onDoneCheck` as accepted (MOD-workflow-entries.md, Interfaces and *The reports of a run*):

- `onTestsFinished`, in `agent-m records`, reads every report of the folder `agent-m-reports/` together with
  `parseOutcomes`; the levels run are the rows that left a report, the occasion the one the names give. An unreadable
  report is left out and the others read again; every test of that row with no case in a readable report reads `not run`
  with the reason `report unreadable: <file>`. A row whose status is `not run: secret missing: <name>` gives its tests
  (by `testsOfRow`) `not run` with that reason, never `failed`. It writes `records.status`. A run without a report or a
  status ends `nothing to do`.
- `onDoneCheck`, in `agent-m done`, reads the head's CI result from the run's statuses and `AGENT_M_EXPECTED`, with no
  call to the server: green only when every expected shard left `done` or `nothing to do` and `records.status` is `done`;
  a missing or other status is not green and the finding names the job.

## Acceptance

- Unit tests naming MOD-workflow-entries over a fixture folder: two shards' reports give one record; a cut-off report
  gives `report unreadable` reasons and the record is still added; a missing-secret status gives `secret missing`
  reasons; `onDoneCheck` is green with all statuses `done`, and not green — naming the job — with one missing, one
  `failed`, or `records.status` absent.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/workflow-entries/` and the tests that name MOD-workflow-entries change.
