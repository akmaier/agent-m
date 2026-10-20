---
id: ITM-620
title: MOD-work-plans' writer sprint-record closes a sprint for an agent
level: module
realises:
  - UC-041
modules:
  - MOD-work-plans
builds_on:
  - ITM-619
tests:
  - unit
origin:
  - the cut of ITM-610 at sprint team1/56: MOD-work-plans' workStrategies, one strategy per item
---
# ITM-620 MOD-work-plans' writer sprint-record closes a sprint for an agent

**REGISTER**

## Outcome

The writer `sprint-record` — an agent's close through `closeSprint`, with the job's provenance lines, under the closer's name; the proposals of the retrospective stay proposals — as MOD-work-plans' file states it. `closeSprint` is built (`src/work-plans/saves.mjs:174`).
It adds its strategy to `workStrategies`, which ITM-610 builds and registers, and changes no registration. With it, `close-sprint` comes closer to being prepared without `UnknownStrategy`.

**Not ready for a sprint yet.** Its readings are settled before it is selected: the functions it calls are read against MOD-work-plans' Uses; the tests of every input and output form it changes are grepped; every path it builds is checked to be reachable through the real host.

## Acceptance

- The strategy works as MOD-work-plans' file states it, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

## Ready: the readings, settled by the Product Owner (AGENTS.md §6a.6, 2026-10-19)

No text needs to change. MOD-work-plans.md:264-265 and `closeSprint` (:222-232) give the writer what it calls. Each input is
named in MOD-work-plans' Uses:
- **`close`** is the job's draft, of `closeSprint`'s `close` shape, which `sprint-record-checks` (ITM-619) has checked.
- **`facts`** are `sprintFacts` of the same sprint, computed as the recipe `sprint-facts` computes them (ITM-618). The writer
  calls the recipe's own function in `strategies.mjs`, so the rule stands once.
- **`architecture`** is the module files of the job's snapshot.
- **`head`** is the snapshot's commit.
- **`trailers`** are `provenanceLines` of the job.

"Under the closer's name" is the commit's author, as `provenanceLines` gives it for the job's participant. "The proposals stay
proposals" is `sprint-record-checks`' rule 4, which already holds before the writer runs.
Its builds_on, ITM-610, is done, and ITM-618 and ITM-619 are on the sprint branch.
