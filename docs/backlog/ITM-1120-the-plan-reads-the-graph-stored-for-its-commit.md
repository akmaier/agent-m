---
id: ITM-1120
title: The plan asks for the graph of its commit, so that the stored graph is read
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-implementation-pages
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-19, measured in docs/measurements/2026-10-19_main-pages-load-work.md
---
# ITM-1120 The plan asks for the graph of its commit, so that the stored graph is read

**REGISTER**

## Outcome

`src/implementation-pages/plan.mjs:106` calls `traceGraph(facts.snapshot)` without `commit`, so it builds the graph even
where `trace-cache` holds it. With the commit given, the stored graph is read in one request.

## Not ready: a draft for akmaier

The draft is 9a2c9f4a. Build this item only once an approval record names the draft's blob of
`docs/architecture/MOD-implementation-pages.md`.

## Acceptance

- Over a fake GitHub with the stored graph of the commit on `trace-cache`, `plan`'s own call builds no graph: `readOn`
  is asked once. Counter-proof: without the stored graph, the graph is built. That no file only the graph reads is read
  by the page as a whole needs MOD-work-plans' `planFindings` as well, which is ITM-1156.
