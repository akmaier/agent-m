---
id: ITM-985
title: A Bridge advances the runs of the products it serves
level: module
realises:
  - UC-043
  - A RUN CONTINUES WITHOUT A CLICK BETWEEN ITS JOBS
modules:
  - MOD-bridge-jobs
builds_on:
  - ITM-977
  - ITM-979
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-043-11, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-985 A Bridge advances the runs of the products it serves

**REGISTER**

## Outcome

MOD-bridge-jobs.md:157-159, `startWatching`: "the next actions of every run of a served product are computed from the
product's facts, those of this route taken and those of other routes queued by their start records". Not built:
`src/bridge-jobs/watch.mjs:2`. On the Bridge's local clone the facts that need server operations are `"unknown"`, so
`nextActions` gives only resumptions, holds and refusals there (MOD-run-planner.md:102-105).

## Acceptance

- Unit tests that name MOD-bridge-jobs, with a served fixture product: a watch round takes the action of this Bridge's route
  and queues another route's by its start record; a run held at a limit starts nothing.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/bridge-jobs/` and the tests that name MOD-bridge-jobs change.
