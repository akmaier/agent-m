---
id: ITM-1119
title: The schedule counts the test declarations stored for the commit, and generate reads the stored graph
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-test-pages
builds_on:
  - ITM-1117
tests:
  - unit
origin:
  - akmaier's request of 2026-10-19, measured in docs/measurements/2026-10-19_main-pages-load-work.md
---
# ITM-1119 The schedule counts the test declarations stored for the commit, and generate reads the stored graph

**REGISTER**

## Outcome

The test counts of the `schedule` route come from `storedFacts`' `tests`. Today `testCounts` (`src/test-pages/schedule.mjs:72`)
reads every test file by itself, which the measurement counted as 1,303 single reads (21.7 s). Without stored facts, the
counts are taken from the files, read in batches. `generate` (`src/test-pages/generate.mjs:91`) asks for the graph
with its commit, so that the stored graph is read.

## Not ready: a draft for akmaier

The draft is 9a2c9f4a. Build this item only once an approval record names the draft's blob of
`docs/architecture/MOD-test-pages.md`.

## Acceptance

- With stored facts for the commit, `schedule` reads no test file, and its counts equal those counted from the files.
  Counter-proof: without stored facts, the test files are read in batches of a hundred.
