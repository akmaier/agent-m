---
id: ITM-1201
title: MOD-trace-graph's traceGraph names the stored graph's file as the code reads it
level: module
realises:
  - THE TRACEABILITY MATRIX IS DERIVED
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-trace-graph
builds_on:
tests:
  - unit
origin:
  - c2e6e5c1 and bbf92700 (2026-10-24), which store the graph gzipped as <commit>.json.gz; the line of traceGraph they left
---
# ITM-1201 MOD-trace-graph's traceGraph names the stored graph's file as the code reads it

**REGISTER**

## Outcome

Since `c2e6e5c1` the graph of a commit is stored gzipped, as `<commit>.json.gz` on the branch `trace-cache`.
- MOD-trace-graph's Data (`docs/architecture/MOD-trace-graph.md:86-89`), `storedGraph` (`:187-192`) and `publishGraph`
  (`:228`) name `<commit>.json.gz`.
- The code reads and writes only that file: `fileOf` (`src/trace-graph/stored.mjs:47`), read by `traceGraph` at
  `src/trace-graph/build.mjs:189`.
- `traceGraph`'s own line (`MOD-trace-graph.md:177-179`) still says it first "reads `<commit>.json` on the branch
  `trace-cache` once".

So the module file says two things of one file.

## Not ready: a draft for akmaier

The line of `traceGraph` is changed to name `<commit>.json.gz`, read with the source's `readOn` and unzipped, as
`storedGraph` names it. `bbf92700` was written on akmaier's instruction, and its acceptance stays with akmaier. This item is
built once the draft is accepted.

## Acceptance

- MOD-trace-graph names one file for a commit's stored graph in every place.
- A unit test pins that `traceGraph` with `options.commit` reads `<commit>.json.gz` and no `<commit>.json`. Where an
  existing test already pins it, that test is named and nothing is added.
