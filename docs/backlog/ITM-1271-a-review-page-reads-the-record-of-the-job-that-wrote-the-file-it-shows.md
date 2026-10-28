---
id: ITM-1271
title: A review page reads the record of the job that wrote the file it shows
level: module
realises:
  - UC-007
  - UC-022
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-review-pages
builds_on: []
tests:
  - component
origin:
  - akmaier, 2026-10-28: "It is unlikely that a user needs all records at once." Then: "Please follow up. I want all pages fixed this way."
---
# ITM-1271 A review page reads the record of the job that wrote the file it shows

**REGISTER**

## Outcome

MOD-review-pages shows, "beside an open file a job wrote, the notes of that job's end record" (UC-007 4a, 4b), and on
*Review all* of the architecture the rounds of the drafting job. To find them it reads every job record:

- `jobNotes` (`src/review-pages/jobs.mjs:232-236`, called at `src/review-pages/flow.mjs:561` for every open use case or
  decision shown): `readJobRecords(snapshot)` and `listJobs` over all of `docs/jobs/` — 478 records, ~7 MB, 5 batches at
  Agent M's head —, then keeps the `note:` lines that name the file's identifier.
- `draftingRounds` (`flow.mjs:104-113`): the same reading, then the first row of kind architecture with an end.

Every commit a job makes carries the trailer `Agent-M-Job: <id>` (`src/job-runner/provenance.mjs:18`), and
MOD-repository-hosts' `readHistory(path, { limit: 1 })` gives the newest commit of a file with its message.

After the change: `jobNotes` reads the newest commit of the file shown (`readHistory`, `limit: 1`), and, where its
message names a job, that one record; a file whose newest commit names no job shows no notes, since no job wrote its
text. `draftingRounds` reads the records newest first, by the identifiers' order, and stops at the first architecture
job with an end. MOD-review-pages' text is unchanged: it names what is shown, not how it is found.

Design principles (AGENTS.md §2 *Designing*): §2.2 *nothing twice* — which job wrote a text is recorded once, in its
commit; the page reads it there instead of searching every record for it.

## Acceptance

Tests written first, each red on the commit that holds only them:

- `tests/review-pages-job-notes-one-record.test.mjs` (MOD-review-pages, component), over a counting fake with 300 job
  records: an open use case whose newest commit carries `Agent-M-Job: JOB-a` shows JOB-a's notes and reads one history
  and one record; one whose newest commit names no job shows none and reads no record. `#review/arc` with an
  architecture job among the ten newest reads at most ten records. Counter-proof: a note of another job naming the same
  use case is not shown.

Measurable outcome: opening an open use case or decision on the live page reads one history and at most one job record
instead of 478 records in 5 batches (~7 MB).

- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/review-pages/` and the tests that name MOD-review-pages change.
