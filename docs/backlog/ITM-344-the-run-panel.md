---
id: ITM-344
title: The run panel
level: module
realises:
  - UC-005
  - UC-007
  - UC-019
  - THE PAGE STATES WHAT IT SENDS WHERE
  - ONE CLICK PER DECISION
  - NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY
  - NO USE CASE IS LEFT OUT OF A PROMPT SILENTLY
  - THE CORRECTION LOOP HAS A FIXED LIMIT
modules:
  - MOD-site-frame
builds_on:
  - ITM-221
tests:
  - unit
origin:
  - UC-005 step 3
  - UC-007 step 2
  - UC-019 steps 4 and 5, 4a, 5a
---
# ITM-344 The run panel

**REGISTER**

## Outcome

MOD-site-frame's `runPanel(prepared, handlers)`, as its file states it, in `src/site-frame/run-panel.mjs`: every
destination — the participant, its part as drafter, reviewer or checker, its model and where it processes data — and
what goes there part by part, with its size against the participant's context and the requirement sources it carries;
what does not fit, and why; each part left out with its reason; the findings that keep the job from starting; the limit
of correction rounds. *Run* is offered only when nothing blocks and everything fits, and pressing it calls `onRun`. The
pages that start a job (ITM-361, ITM-362, ITM-363) show it.

## Acceptance

- Unit tests that name MOD-site-frame state, before the code exists, for fixture `Prepared` values: the destinations
  and parts with their sizes; a participant whose context is too small, named, with no *Run*; a part left out with its
  reason; a blocking finding with no *Run*; *Run* calling `onRun` once.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/site-frame/` and the tests that name MOD-site-frame change.
