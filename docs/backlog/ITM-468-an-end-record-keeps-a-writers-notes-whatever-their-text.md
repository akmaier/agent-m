---
id: ITM-468
title: An end record keeps a writer's notes, whatever their text
level: module
realises:
  - UC-007
  - A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
  - A RECORD IS EVIDENCE, NOT A PROPOSAL
modules:
  - MOD-job-ledger
builds_on:
  - ITM-317
  - ITM-390
tests:
  - unit
origin:
  - ITM-362, #473: UC-007 4a's note holds a comma and cannot be appended
  - MOD-job-ledger, Data: the part End; MOD-documents, a list in a line separated by commas
---
# ITM-468 An end record keeps a writer's notes, whatever their text

**REGISTER**

## Outcome

MOD-job-ledger's `appendToRecord` writes an End that keeps every note of the job's writer as the writer wrote it — a
note naming a use case and a requirement's name with a comma among them, as UC-007 4a's note does —, and its reader
gives the notes back the same.

The code does so on `main` without a text that states it: commit `9ab15a19` writes an End's notes as a field `notes` of
JSON (`src/job-ledger/index.mjs:510`) and reads them back (`:315`), and `tests/job-ledger-append.test.mjs:110` checks a
note with commas and quotes. MOD-job-ledger's file names no notes — the End holds `results:` "commits, files, pull
request, issues" (`docs/architecture/MOD-job-ledger.md:98`, `:151`). What is missing is akmaier's acceptance of a change
of that file naming where an End keeps its notes; until then the item stays open.

## Acceptance

- Unit tests that name MOD-job-ledger state, before the code exists: an End appended with two notes, one of them
  holding commas and quotes, read back with both notes as they were written; an End without notes read as before.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/job-ledger/` and the tests that name MOD-job-ledger change.
