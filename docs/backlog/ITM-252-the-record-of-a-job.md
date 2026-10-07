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
  - MOD-documents
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
them, the release panel reads its state from its record (UC-013), and a release test report that waits is found by its
run's record (ITM-239).

Every part is read as the file writes it — the lines `gate record:`, `works on:` and `jobs at once:` with their spaces —
through MOD-documents, which reads the record. The part of MOD-documents this needs is built in `src/documents/`: a field
of a section or of an appended section whose key is words of a front matter key's form separated by single spaces, such
as `gate record`, named in a schema, read, and appended by `appendSection`, as written; a front matter key stays as
MOD-text-tools states it. The round record an End holds is MOD-job-runner's (`roundsText`,
`rounds.schema.md`), which no item has built and no job has written yet: reading it is not part of this item, and an End
is read without it. Every other line of a part is: a question to the author, `question:` under `## Gate reached`, and an
End's `draft:`, one fenced JSON block, among them.

Appending to a record and taking a job, which the routes do (UC-010, UC-011), and reading the records newest first
(ITM-239) are not part of this item. Nothing else of either module is part of this item.

## Acceptance

- Unit tests that name MOD-job-ledger state, before the code exists: an identifier of the record's form, none of those
  taken; the start of a record with each of its parts, read back as the same start; a record with each kind of part
  appended as the file writes it — `gate record:`, `works on:` and `jobs at once:` with their spaces, a question to the
  author as `question:` under `## Gate reached`, an End's `draft:` as one fenced JSON block —, read, the question as the
  record's question and the draft as its End's draft, its End without a round record; the state of a record by its last
  part, with a live state and without one; the jobs of two products newest first, those waiting at a gate first among
  those that have not ended, and a record that cannot be read listed with the reason; the cost as reported, at the
  declared price, or unknown, never zero.
- Unit tests that name MOD-documents state, before the code exists: a schema whose section and appended section name a
  field whose key holds spaces loads; such a line is read into that field; `appendSection` writes it as given.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/job-ledger/`, `src/documents/` and the tests that name MOD-job-ledger or MOD-documents change (`AN
  IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
