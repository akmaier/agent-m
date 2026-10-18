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
`deab7a3b`) to find the job that drafted a file. It goes through `readJobRecords` (`src/review-pages/common.mjs:78-82`) and
`listJobs`, also when no job drafted it. ITM-875's measurement found this (sprint team1/87, developer-sonnet-d).

MOD-job-ledger offers `recordsNewestFirst`: "the job records of a snapshot, newest first …, each read only when its caller
asks for the next one, so that a caller that looks for a recent job stops reading where it has found it"
(MOD-job-ledger.md:179-181). MOD-review-pages' Uses do not name it. A draft adds it (MOD-review-pages.md, Uses and the
line on MOD-job-ledger), committed for akmaier with this item.

**A limit, named before the work:** when no job drafted the file, newest first still reads every record. The item's first
task counts, on this repository and on a fixture, the records read with and without the change. If the change saves
nothing at this repository's state, the item stops and reports it.

## Acceptance

- Finding the drafting job of a file reads job records newest first and no further than the one that drafted it. A test
  counts the records read on a fixture, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- It waits for akmaier's acceptance of the draft in MOD-review-pages.md.
