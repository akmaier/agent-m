---
id: ITM-619
title: MOD-work-plans' check sprint-record-checks
level: module
realises:
  - UC-041
  - AN AGENT'S REVIEW NAMES WHERE ITS FEEDBACK CAME FROM
  - AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF
modules:
  - MOD-work-plans
builds_on:
  - ITM-610
tests:
  - unit
origin:
  - the cut of ITM-610 at sprint team1/56: MOD-work-plans' workStrategies, one strategy per item
---
# ITM-619 MOD-work-plans' check sprint-record-checks

**REGISTER**

## Outcome

The check `sprint-record-checks` — an agent's review that does not name the sources of its feedback, or does not say that no stakeholder took part when none did; a retrospective without an entry; a change to the process written as applied rather than proposed — as MOD-work-plans' file states it.
It adds its strategy to `workStrategies`, which ITM-610 builds and registers, and changes no registration. With it, `close-sprint` comes closer to being prepared without `UnknownStrategy`.

**Not ready for a sprint yet.** Its readings are settled before it is selected: the functions it calls are read against MOD-work-plans' Uses; the tests of every input and output form it changes are grepped; every path it builds is checked to be reachable through the real host.

## Acceptance

- The strategy works as MOD-work-plans' file states it, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
