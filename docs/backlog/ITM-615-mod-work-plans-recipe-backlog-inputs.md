---
id: ITM-615
title: MOD-work-plans' recipe backlog-inputs
level: module
realises:
  - UC-032
modules:
  - MOD-work-plans
builds_on:
  - ITM-610
tests:
  - unit
origin:
  - the cut of ITM-610 at sprint team1/56: MOD-work-plans' workStrategies, one strategy per item
---
# ITM-615 MOD-work-plans' recipe backlog-inputs

**REGISTER**

## Outcome

The recipe `backlog-inputs` — the accepted requirements and use cases, those no item realises yet, the architecture, and the existing items, which its part carries as artifacts keyed by their title — as MOD-work-plans' file states it.
It adds its strategy to `workStrategies`, which ITM-610 builds and registers, and changes no registration. With it, `propose-items` comes closer to being prepared without `UnknownStrategy`.

**Not ready for a sprint yet.** Its readings are settled before it is selected: the functions it calls are read against MOD-work-plans' Uses; the tests of every input and output form it changes are grepped; every path it builds is checked to be reachable through the real host.

## Acceptance

- The strategy works as MOD-work-plans' file states it, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
