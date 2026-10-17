---
id: ITM-633
title: The system's decisions are read in one place
level: module
realises:
  - UC-045
  - UC-024
modules:
  - MOD-trace-graph
  - MOD-run-planner
  - MOD-work-plans
builds_on:
  - ITM-610
tests:
  - unit
origin:
  - ITM-610's gate (docs/gates/20261017-0155-development-release-testing-6b7e.md)
---
# ITM-633 The system's decisions are read in one place

**REGISTER**

## Outcome

Two recipes select, from MOD-trace-graph's graph, the same decisions:
- the one that refines no other;
- the subsystems' decisions, which refine it and design a module.

They do it in `src/run-planner/inputs.mjs` (the system step) and in `src/work-plans/strategies.mjs`
(`architecture-and-model`). MOD-trace-graph's `systemDecisions(graph)` gives them once, and both call it (nothing
twice).

The review pages order the architecture by the same groups (`src/review-pages/flow.mjs:50`, `architectureOrder`), but
from the files' texts, not from the graph. Whether they can call `systemDecisions` is read before the start. If they
can, MOD-review-pages joins the modules.

It waits for akmaier's acceptance of the draft committed with ITM-610's gate. That draft gives MOD-trace-graph
`systemDecisions`, and the Uses of MOD-run-planner and MOD-work-plans name it.

## Acceptance

- `systemDecisions` gives the system's decisions and the subsystems' decisions by identifier. A decision that refines
  the system and designs no module is in neither.
- Both recipes call it and copy no rule of their own, and their parts stay as they are.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
