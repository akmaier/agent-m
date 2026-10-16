---
id: ITM-573
title: A test exercises its module in the trace graph
level: module
realises:
  - DEVELOP AGAINST INTERFACES
modules:
  - MOD-trace-graph
builds_on:
tests:
  - unit
origin:
  - ITM-568's stop at sprint team1/52: its recipe gives "the tests that name" a module, and MOD-trace-graph's Graph names the edge `exercises`, which `testFileGraph` (src/trace-graph/build.mjs:60–66) does not build
---
# ITM-573 A test exercises its module in the trace graph

**REGISTER**

## Outcome

MOD-trace-graph's `Graph` lists `exercises` among its edges' `via`. `testFileGraph` (`src/trace-graph/build.mjs:60–66`)
builds only a `guards` edge from each test to what it guards. A run of `traceGraph` over the repository finds no
`exercises` edge, against the 7,968 `guards` edges the same run finds as the known positive.

**The reading.** Each test declaration that names a module gives an `exercises` edge from the test to that module, at
the declaration's path and line. A test names its module in its declaration, `module: MOD-<name>`, which
`testDeclarations` reads as `d.module`. Where `d.module` is no `MOD-` identifier, there is no edge.

**Existing tests.** No expected result changes:
- A grep of `tests/` for `via: "exercises"` finds none.
- The test that compares a test file's whole list of edges, TST-478016 (`tests/trace-graph-guards.test.mjs:93`), uses a
  sample whose declarations name no module.
- The other trace-graph tests filter edges by kind or by origin.

All of `tests/trace-graph-*.test.mjs` are run with the change.

## Acceptance

- **The edge.** A fixture test file with two declarations, one naming `MOD-reader`, gives one `exercises` edge, from that
  test to `MOD-reader` at its line.
- **The counter-proof.** The declaration that names no module gives none.
- **Tests first.** The first commit holds only the tests, and CI is red on it. No stub is committed.
