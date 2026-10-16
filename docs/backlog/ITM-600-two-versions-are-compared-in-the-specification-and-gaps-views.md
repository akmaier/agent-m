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

UC-020 1b: "compares two versions". MOD-trace-graph provides `compareGraphs`, which is not built (`src/trace-graph/index.mjs:10-11`).

## Acceptance

- `compareGraphs` works as its file states it.
- The views show what was added, removed and changed between two versions.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
