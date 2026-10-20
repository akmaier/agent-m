---
id: ITM-1117
title: A commit's facts are stored beside its overview, and productFacts reads them
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-progress-measures
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-19, measured in docs/measurements/2026-10-19_main-pages-load-work.md
---
# ITM-1117 A commit's facts are stored beside its overview, and productFacts reads them

**REGISTER**

## Outcome

`publishOverview` adds `<commit>.facts.json` beside `<commit>.json` on the branch `overview-cache`, in the same commit. The
file holds the facts that the commit's files alone give, as MOD-progress-measures' Data lists them. `productFacts` reads
them first, through `storedFacts`, and then reads only the live facts. The measurement found these file reads on the
paths that `productFacts` serves:
- MOD-main-page's build scope: 30 batches, 105.6 s;
- `plan`: 32 batches, 110.3 s.

## Not ready: a draft for akmaier

The draft is 9a2c9f4a. Build this item only once an approval record names the draft's blob of
`docs/architecture/MOD-progress-measures.md`.

## Acceptance

- Over a counting fake GitHub that serves a stored facts file for the commit, `productFacts` reads none of the files the
  stored facts come from. The facts it returns equal those it returns without the stored file. Counter-proof: with no
  stored file, or with one that names another commit, it reads the files as before.
- `publishOverview` adds both files in one commit, and leaves a file the branch already holds as it is.
- The stored file holds the job records, not their rows. A job that has not ended shows its elapsed time at the read,
  not at the time CI wrote the file. A model that could not be read is not stored. A file with
  another format's number reads as `null`.
