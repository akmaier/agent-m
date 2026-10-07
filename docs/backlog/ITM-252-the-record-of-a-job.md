---
id: ITM-252
title: The record of a job
level: module
realises:
  - UC-013
  - A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
  - A JOB IDENTIFIER IS NEVER REUSED
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
modules:
  - MOD-job-ledger
builds_on:
tests:
  - unit
origin:
  - UC-013
---
# ITM-252 The record of a job

**REGISTER**

## Outcome

MOD-job-ledger's `JobStart`, `RecordPart`, `JobRecord`, `LiveState`, `JobState`, `Cost`, `JobRow`, `newJobId`,
`startRecord`, `jobState`, `listJobs` and `jobCost`, as its file states them, in `src/job-ledger/`, with the schema
`job.schema.md`: a job's identifier, none of those its product holds; the start of its record; a record read with every
part appended to it; its state from its last part and, for a job that has not ended, from its runtime's live state; and
every job of the products given, newest first, with its cost. The complete run of a release candidate is queued with
them, and the release panel reads its state from its record (UC-013). Appending to a record and taking a job, which the
routes do (UC-010, UC-011), and reading the records newest first (ITM-239) are not part of this item. Nothing else of the
module is part of this item.

## Acceptance

- Unit tests that name MOD-job-ledger state, before the code exists: an identifier of the record's form, none of those
  taken; the start of a record with each of its parts, read back as the same start; a record with each kind of part
  appended, read; the state of a record by its last part, with a live state and without one; the jobs of two products
  newest first, those waiting at a gate first among those that have not ended, and a record that cannot be read listed
  with the reason; the cost as reported, at the declared price, or unknown, never zero.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/job-ledger/` and the tests that name MOD-job-ledger change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
