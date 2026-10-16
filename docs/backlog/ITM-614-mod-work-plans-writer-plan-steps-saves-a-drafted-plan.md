---
id: ITM-614
title: MOD-work-plans' writer plan-steps saves a drafted plan
level: module
realises:
  - UC-045
modules:
  - MOD-work-plans
builds_on:
  - ITM-613
tests:
  - unit
origin:
  - the cut of ITM-610 at sprint team1/56: MOD-work-plans' workStrategies, one strategy per item
---
# ITM-614 MOD-work-plans' writer plan-steps saves a drafted plan

**REGISTER**

## Outcome

The writer `plan-steps` — the drafted plan through `savePlan`, with the job's provenance lines — and `savePlan` itself, as MOD-work-plans' file states them. `savePlan` is not built.
It adds its strategy to `workStrategies`, which ITM-610 builds and registers, and changes no registration. With it, `draft-plan` comes closer to being prepared without `UnknownStrategy`.

**Not ready for a sprint yet.** Its readings are settled before it is selected: the functions it calls are read against MOD-work-plans' Uses; the tests of every input and output form it changes are grepped; every path it builds is checked to be reachable through the real host.

## Acceptance

- The strategy works as MOD-work-plans' file states it, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
