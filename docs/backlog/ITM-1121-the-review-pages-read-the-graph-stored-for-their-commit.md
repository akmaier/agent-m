---
id: ITM-1121
title: The review pages ask for the graph of an unedited commit with its commit
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-review-pages
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-19, measured in docs/measurements/2026-10-19_main-pages-load-work.md
---
# ITM-1121 The review pages ask for the graph of an unedited commit with its commit

**REGISTER**

## Outcome

`graphOnce` (`src/review-pages/sections.mjs:162`), `arrange.mjs:41`, `jobs.mjs:104`, `jobs.mjs:500`, `edit.mjs:56` and
`entry-edit.mjs:33` call `traceGraph(snapshot)` without `commit`. Where the files are the commit's own, each asks with
the commit, so that `trace-cache` is read. A graph over an edited text (`file-edit.mjs:155`) is still built. Read each
call site first, to see whether its source holds an edited text.

## Not ready: a draft for akmaier

The draft is 9a2c9f4a. Build this item only once an approval record names the draft's blob of
`docs/architecture/MOD-review-pages.md`.

## Acceptance

- *Review all* of the architecture, with a changed module file whose impact list is not stored, reads the stored graph
  of the commit and builds none. Counter-proof: a graph over an edited text is built from the files and never read
  from `trace-cache`.
