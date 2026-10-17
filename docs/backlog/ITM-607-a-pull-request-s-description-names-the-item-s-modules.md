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

**Settled at sprint team1/67's start, added as its fourth item. Selectable.**
- **The module whose files it changes:** MOD-runtimes, `pull-request.mjs` (`describe`, :32-44).
- **The grep, full output read:**
  - `grep -rn "Modules:" src/runtimes` finds `pull-request.mjs:40` alone.
  - The test that pins the description is `tests/runtimes-pull-request.test.mjs`, TST-567001 at :101-113. Its expected
    `Modules:` line changes, as the item names.
  - `traceGraph` is called in `src/run-planner/inputs.mjs:49` and in no file of MOD-runtimes yet.
- **The rule is the interface, not another module's code** (sprint 60's agreement). MOD-runtimes' accepted Uses
  (`MOD-runtimes.md:267`) read: "`MOD-trace-graph.traceGraph` — the modules of the plan step or backlog item a pull
  request names: its `changes` edges".
  - So the writer reads the `changes` edges of the step's or item's node in `traceGraph(snapshot)`.
  - MOD-run-planner's code is not copied. The item's own words "the way MOD-run-planner reads" mean that same interface.
- **Reads, against the token budget** (sprint 66). The writer builds the job snapshot's graph once per pull request it
  opens.
  - On this repository that graph costs 11 GraphQL batches with a token, as measured at ITM-597's gate. Without a token
    nothing is written at all.
  - The pull request states the requests of one write on base and head, and adds no read when no step or item is
    named.
- **The expected results that change** (sprint 64): TST-567001's `Modules:` line, and any other the developer's run on a
  draft lists before the tests-only commit.
- **Reachable:** every `implement` job's writer, through MOD-runtimes' `routeStrategies`.

## Acceptance

- For an item naming two modules, one of which no new test declares, the description names both, in the item's order.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**The draft it waited for is accepted** (akmaier, `b43da779`): MOD-runtimes' use of `traceGraph` (MOD-runtimes, accepted blob 83f1eaa07790). It is free of drafts; its readings are read at its start.
