---
id: ITM-940
title: The overview of a commit is stored, and productFacts reads the build alone
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
  - PROGRESS AND JOB STATE ARE DERIVED, NOT STORED
  - UC-049
modules:
  - MOD-progress-measures
builds_on:
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 to precompute the overview on the first page after a merge into main
---
# ITM-940 The overview of a commit is stored, and productFacts reads the build alone

**REGISTER**

## Outcome

Rests on the draft `c6baba33`, MOD-progress-measures.md:107-110, :152-154 and :234-242. It starts when akmaier has accepted
it, and the quotes are checked against the accepted blob first:
- "`<commit>.json` on the branch `overview-cache` ... the main page's overview of that commit, which `publishOverview` adds
  and no one changes or deletes: `{ commit, shares, waiting }`".
- "with the scope `build`, what `buildInProgress` takes and nothing else — the plan or the backlog, the job records and
  the live state of every job that has not ended, and the pull requests".
- `storedOverview(snapshot)`, read "with the snapshot's `readOn` in one request".

Whether `PROGRESS AND JOB STATE ARE DERIVED, NOT STORED` allows a stored overview is read at the start. The overview is
derived from one commit alone and is never edited, as the graph on `trace-cache` is.

## Acceptance

- Unit tests that name MOD-progress-measures, over a fake host:
  - `publishOverview` adds `<commit>.json` with `stageShares` and `waitingForAPerson` of the facts, and leaves an existing
    file as it is (`written: false`);
  - `storedOverview` reads it back in one request, and gives `null` for a missing branch or file;
  - `productFacts` with the scope `build` reads no use case, decision or test file, and `buildInProgress` gives the same
    list as with the scope `all`.
- Counter-proof: with the scope `build` reading as `all`, the count test fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/progress-measures/` and the tests that name MOD-progress-measures change.
