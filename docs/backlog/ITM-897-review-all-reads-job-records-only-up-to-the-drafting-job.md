---
id: ITM-897
title: Review all reads the job records only up to the job that drafted the file
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
  - UC-023
modules:
  - MOD-review-pages
builds_on:
  - ITM-876
tests:
  - unit
origin:
  - ITM-875's stop (sprint team1/87), from developer-sonnet-d's measurement
---
# ITM-897 Review all reads the job records only up to the job that drafted the file

**REGISTER**

## Outcome

Review all of the whole architecture reads every job record of the repository (`docs/jobs/`, 372 files in 4 batches at
`deab7a3b`) to find the job that drafted a file. It goes through `readJobRecords` (`src/review-pages/common.mjs:86-90`) and
`listJobs`, also when no job drafted it; the search is `draftingRounds` (`src/review-pages/flow.mjs:104-113`, called at
`:396`). `docs/jobs/` holds 478 records at `78f10185`, still none of `derive-architecture`. ITM-875's measurement found this (sprint team1/87, developer-sonnet-d).

MOD-job-ledger offers `recordsNewestFirst`: "the job records of a snapshot, newest first …, each read only when its caller
asks for the next one, so that a caller that looks for a recent job stops reading where it has found it"
(MOD-job-ledger.md:182-186). MOD-review-pages' Uses do not name it. A draft adds it (MOD-review-pages.md, Uses and the
line on MOD-job-ledger), committed for akmaier with this item.

**A limit, named before the work:** when no job drafted the file, newest first still reads every record. The item's first
task counts, on this repository and on a fixture, the records read with and without the change. If the change saves
nothing at this repository's state, the item stops and reports it.

## Acceptance

- Finding the drafting job of a file reads job records newest first and no further than the one that drafted it. A test
  counts the records read on a fixture, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- It waits for akmaier's acceptance of the draft in MOD-review-pages.md.

**Stopped at its first task (sprint team1/89, developer-sonnet-d), back to the backlog.** The count on the 372 real
records (`ITM-897-count.mjs`):

| Fixture | Today | With `recordsNewestFirst` |
|---|---|---|
| This repository | 372 records in 4 batched requests | 372 records in 372 single reads |
| Drafting job is the newest | 373 in 4 | 1 in 1 |
| Drafting job at rank 50 | 373 in 4 | 50 in 50 |

- `docs/jobs/` holds no `derive-architecture` record, so newest first reads to the end. The counting is sound: the same
  count finds the implement records.
- `recordsNewestFirst` reads one record per request. It saves requests only when the drafting job is among about the four
  newest, and otherwise it sends more than today's batches. That would go against `A PAGE LOAD READS THE REPOSITORY IN
  BATCHES` (SPEC.md:672).
- A version that saves requests needs `recordsNewestFirst` to read in batches of at most 100. That is an interface
  decision of MOD-job-ledger that no accepted text makes. The item is not buildable as specified (sprint 79's agreement)
  and waits for such a draft. The accepted line in MOD-review-pages' Uses stays unbuilt until then.
- **Also found:** `jobNotes` (`src/review-pages/jobs.mjs:232`, called from `flow.mjs:561` on the file page of a kind with
  drafts) reads every record through `readJobRecords` and `listJobs` too. It collects every job whose end names the file,
  so stopping at the newest cannot help it. It reads in batches and breaks no sentence. It is noted here for the same
  draft.

