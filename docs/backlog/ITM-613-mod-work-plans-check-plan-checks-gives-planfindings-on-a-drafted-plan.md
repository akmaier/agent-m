---
id: ITM-613
title: MOD-work-plans' check plan-checks gives planFindings on a drafted plan
level: module
realises:
  - UC-045
modules:
  - MOD-work-plans
builds_on:
  - ITM-610
tests:
  - unit
origin:
  - the cut of ITM-610 at sprint team1/56: MOD-work-plans' workStrategies, one strategy per item
---
# ITM-613 MOD-work-plans' check plan-checks gives planFindings on a drafted plan

**REGISTER**

## Outcome

The check `plan-checks` — `planFindings` on a drafted plan — and `planFindings` itself, as MOD-work-plans' file states them. `planFindings` is not built.
It adds its strategy to `workStrategies`, which ITM-610 builds and registers, and changes no registration. With it, `draft-plan` comes closer to being prepared without `UnknownStrategy`.

**It waits for a draft for akmaier**, read at sprint team1/61's start under sprint 60's agreement: a reading never
follows another module's code; it names the interface.
- `planFindings` as accepted names five checks. Two of them MOD-trace-graph's `graphFindings` already gives:
  - "a plan step whose `tests` are not those of its `level`" (`A PLAN STEP NAMES THE TESTS OF ITS LEVEL`);
  - "a cycle among the modules' uses" (`MODULES DEPEND ON EACH OTHER WITHOUT A CYCLE`).
- MOD-work-plans' Uses do not name `graphFindings`, so building them here would keep both rules twice.
- The draft, committed with sprint team1/61's start, has `planFindings` take those two from `graphFindings`. It runs
  them on the graph of the product with the drafted steps in place, through a `TextSource`. It keeps the other three
  checks of its own: a module, subsystem or system without a step; the order of the uses; a step without a phase.
- The draft adds `MOD-trace-graph.graphFindings` and `TextSource` to MOD-work-plans' Uses.

**Ready to be selected** once akmaier accepts the draft.

## Acceptance

- The strategy works as MOD-work-plans' file states it, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**The draft it waited for is accepted** (akmaier, `b43da779`): MOD-work-plans' `planFindings` taking two checks from `graphFindings`, with `TextSource` in its Uses (accepted blob eb9c90e38eb9). It is free of drafts; its readings are read at its start.
