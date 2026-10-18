---
id: ITM-735
title: The trace graph holds the code files and the imports between module folders
level: module
realises:
  - UC-025
  - THE TRACEABILITY MATRIX IS DERIVED
  - A MODULE IS A FOLDER
  - EVERY CODE FILE BELONGS TO A MODULE
modules:
  - MOD-trace-graph
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-735 The trace graph holds the code files and the imports between module folders

**REGISTER**

## Outcome

UC-025 step 2 reads "the files in every module's folder and the imports between them". MOD-trace-graph states it in
its Data and its part `code.mjs`: code files — by extension, outside `docs/`, test files and folders named `vendor` or
`node_modules` — as nodes of the kind `code`, each belonging to the module whose `folder` holds it, and, for JavaScript,
TypeScript, Python and CSS, `imports` edges to the modules they import. `src/trace-graph/index.mjs` says "The code files
and their imports ... are not built yet", and the folder holds no `code.mjs`.

This item builds that part of `traceGraph`, as the file states it, without changing `Graph` or any other function's
result. `moduleRows` (ITM-692) reads these nodes and edges; a file whose language's imports are not read keeps that
fact, for `importsRead`.

## Acceptance

- With a fixture snapshot of two module folders, a code file outside every folder, a vendor folder and a test file: one
  `code` node per code file with its module, none for the excluded files; an import from one module folder into another
  as an `imports` edge, for each of the four languages; a file of another language marked as not read.
- The existing tests of `traceGraph` and `architectureImpact` stay green with their expected results.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Measured before its selection (sprint team1/84, 2026-10-18, developer-sonnet-c, read-only).**
- **Consumers.** Sixteen files hold the eighteen calls of `traceGraph`. None reads a `code` node, an `imports` edge or
  `graph.unread`. `derive.mjs:46-48` reads the kind of an edge's `from`; an imports edge's `from` is a code node, which
  exists.
- **Requests.** On the 4,898 tracked files of `40927afd`, with a token, a `traceGraph` call goes from 22 requests to 24 with
  code files and imports. That is two more batches for 249 files of 2.0 MB. Without a token it goes from 1,930 to 2,179
  single reads.
- **The tests that pin the absence today,** quoted at the start: `tests/trace-graph-architecture-impact.test.mjs:114-115`
  (TST-554001), and `tests/trace-graph-read-many.test.mjs:131` and `:133` (TST-479008).
- **Its acceptance commits the count** as a test on a recorded fixture, because the probe's counts move with the repository.
