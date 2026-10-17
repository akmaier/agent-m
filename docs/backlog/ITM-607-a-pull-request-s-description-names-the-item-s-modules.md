---
id: ITM-607
title: A pull request's description names the item's modules
level: module
realises:
  - UC-024
modules:
  - MOD-runtimes
builds_on:
  - ITM-567
tests:
  - unit
origin:
  - ITM-567's gate (docs/gates/20261016-2229-development-release-testing-1dc6.md): the description names the modules the new tests declare, where MOD-runtimes says "the plan step or backlog item, its modules"
---
# ITM-607 A pull request's description names the item's modules

**REGISTER**

## Outcome

The writer `branch-and-pull-request` names in the description the modules of the plan step or backlog item, as
MOD-runtimes states it. It reads them as the `changes` edges of MOD-trace-graph's `traceGraph` over the job's snapshot,
the way MOD-run-planner reads an item's modules.

It waits for akmaier's acceptance of the draft committed with ITM-567's gate, which adds `MOD-trace-graph.traceGraph`
to MOD-runtimes' Uses.

**Existing test whose expected result changes:** TST-567001 (`tests/runtimes-pull-request.test.mjs`), whose `Modules:`
line is the new tests' modules today.

## Acceptance

- For an item naming two modules, one of which no new test declares, the description names both, in the item's order.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**The draft it waited for is accepted** (akmaier, `b43da779`): MOD-runtimes' use of `traceGraph` (MOD-runtimes, accepted blob 83f1eaa07790). It is free of drafts; its readings are read at its start.
