---
id: ITM-600
title: Two versions are compared in the specification and gaps views
level: module
realises:
  - UC-020
modules:
  - MOD-trace-graph
  - MOD-trace-pages
builds_on:
  - ITM-594
  - ITM-599
tests:
  - unit
  - component
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-600 Two versions are compared in the specification and gaps views

**REGISTER**

## Outcome

UC-020 1b: "compares two versions". MOD-trace-graph provides `compareGraphs` (`docs/architecture/MOD-trace-graph.md:260`), which is not built: no file under `src/` names it.

**The reading of 2026-10-17 (sprint team1/63): it waits for ITM-599's merge.** It compares in that view.
`compareGraphs` and `showDifference` are in MOD-trace-pages' Uses. `compareGraphs` is not built, and its rule is stated in
MOD-trace-graph's file.

**Since `c2e6e5c1`** a page reads a version's graph only through `storedGraph` (`<commit>.json.gz` on `trace-cache`,
`bbf92700`) and never builds one; the workflow *main changed* stores it for the heads of the default branch it runs on
(MOD-workflow-entries' `onMainChanged`). So the views compare the two stored graphs, and a version whose commit has none
stored — a release tag on a commit no run stored, or a commit stored before the gzipped format — is named with
`GraphNotStored`, never built. Whether a tag's graph is stored is read at the start; where no text stores it, the item
stops for a draft to akmaier.

## Acceptance

- `compareGraphs` works as its file states it.
- The views show what was added, removed and changed between two versions.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
