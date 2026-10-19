---
id: ITM-618
title: MOD-work-plans' recipe sprint-facts
level: module
realises:
  - UC-041
modules:
  - MOD-work-plans
builds_on:
  - ITM-610
  - ITM-581
tests:
  - unit
origin:
  - the cut of ITM-610 at sprint team1/56: MOD-work-plans' workStrategies, one strategy per item
---
# ITM-618 MOD-work-plans' recipe sprint-facts

**REGISTER**

## Outcome

The recipe `sprint-facts` — the sprint's facts, the product's issues opened or closed during the sprint, its job records and result records, each named as a source, never a mail — as MOD-work-plans' file states it. The issues need MOD-repository-hosts' `listIssues`, which ITM-581 builds.
It adds its strategy to `workStrategies`, which ITM-610 builds and registers, and changes no registration. With it, `close-sprint` comes closer to being prepared without `UnknownStrategy`.

**Not ready for a sprint yet.** Its readings are settled before it is selected: the functions it calls are read against MOD-work-plans' Uses; the tests of every input and output form it changes are grepped; every path it builds is checked to be reachable through the real host.

## Acceptance

- The strategy works as MOD-work-plans' file states it, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

## Waits for a draft for akmaier (2026-10-19)

Settling its readings found inputs that MOD-work-plans' Uses do not name:
- `sprint-facts` needs the product's jobs (`listJobs`), the branch `test-results` (`readSnapshot`) and the tests with what they guard
  (`testDeclarations`);
- `plan-checks` needs the product's workflow (`workflowOf`, from the declaration, the instance's `catalogue` and its SPEC).
A draft of MOD-work-plans names them and is under review before it goes to akmaier. The item is ready once it is accepted.

**The draft is on main for akmaier** (`3baeb13a`, reviewed). Once accepted, the item is ready. A reading for its build:
MOD-workflow-entries' `onSchedule` queues the `close-sprint` job, and puts the sprint into its parameters as `sprint`. No
kind file declares parameters, so this needs no text change.
