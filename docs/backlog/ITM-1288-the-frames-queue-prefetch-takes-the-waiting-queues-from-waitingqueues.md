---
id: ITM-1288
title: The frame's queue prefetch takes the waiting queues from waitingQueues
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-site-frame
builds_on:
  - ITM-1272
  - ITM-1266
tests:
  - unit
origin:
  - developer-sonnet-j's report on ITM-1272 (PR #1385)
---
# ITM-1288 The frame's queue prefetch takes the waiting queues from waitingQueues

**REGISTER**

## Outcome

ITM-1272 gave MOD-progress-measures `waitingQueues`: the head's overview, else the one stored last, else every queue. The
frame's load still keeps its own part of that rule: `src/site-frame/dashboard-app.mjs:341-346` reads `storedOverview`
alone to choose the queues whose files it prefetches in a second wave, and else every queue's index, without the step
to the overview stored last. That is a second copy of the rule (AGENTS.md §2 principle 2). The prefetch takes the queues
from `waitingQueues`, as the specification and the dashboard's waiting-for-acceptance do; where the module files do not
name that use, the item stops and names it.

## Not ready: a draft for akmaier

MOD-site-frame's Uses name `MOD-progress-measures.storedOverview` and not `waitingQueues` (MOD-site-frame.md:8-36). So a
draft names `MOD-progress-measures.waitingQueues` among MOD-site-frame's Uses, for the queues the load prefetches. The item
is built once the draft is accepted.

## Acceptance

- The load's request counts in `tests/load-per-view.test.mjs` hold, or fall where the overview stored last is used.
- Only `src/site-frame/` and its tests change.
