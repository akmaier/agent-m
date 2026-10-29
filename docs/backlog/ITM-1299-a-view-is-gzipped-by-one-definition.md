---
id: ITM-1299
title: A view is gzipped by one definition
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-progress-measures
  - MOD-trace-graph
builds_on:
  - ITM-1260
tests:
  - unit
origin:
  - po-opus-c's gate of ITM-1260 (PR #1406), docs/gates/20261029-0637-development-release-testing-60ac.md, reading 5
---
# ITM-1299 A view is gzipped by one definition

**REGISTER**

## Outcome

MOD-progress-measures stores its views "gzipped as the trace graph is (MOD-trace-graph)" (MOD-progress-measures.md:129).
ITM-1260 writes that gzip and its reading in `src/progress-measures/views.mjs` over `CompressionStream`, beside
MOD-trace-graph's own lines (`src/trace-graph/stored.mjs`, `build.mjs`). MOD-trace-graph's interface offers neither. So
the rule stands twice (AGENTS.md §2 principle 2), and DEVELOP AGAINST INTERFACES leaves no way to share it without a
change of the module files.

## Not ready: a draft for akmaier

A draft gives one module's interface the gzip of a text and its reading, and names it in the Uses of the other. The
draft names which module that is. This item is built once the draft is accepted.

## Acceptance

- Once the draft is accepted: one definition gzips and reads the stored graph and the views. The existing tests of both
  modules pass unchanged (refactoring).
- Only the folders of the two modules and the tests that name them change.
