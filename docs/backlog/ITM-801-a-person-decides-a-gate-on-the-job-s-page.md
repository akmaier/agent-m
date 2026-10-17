---
id: ITM-801
title: A person passes or rejects a gate on the job's page
level: module
realises:
  - UC-034
  - A JOB STOPS AT EVERY GATE
  - A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS
  - A GATE IS DECIDED WITHIN THE JOB'S ROLE ASSIGNMENT
  - THE GATE IS RECORDED
  - ONE CLICK PER DECISION
modules:
  - MOD-main-page
builds_on:
  - ITM-785
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-801 A person passes or rejects a gate on the job's page

**REGISTER**

## Outcome

UC-034 step 7 for a person, and 7a. MOD-main-page builds the route `jobs`; its route `job` is a later item
(`src/main-page/index.mjs:2`), and none is in the backlog. This item builds of `job` only what UC-034 needs: for a job
waiting at a gate, the gate — what it checks, what to examine, who decides — and, for a person `mayDecide` admits,
*Pass gate* and *Reject* with a reason, recorded with `recordGateDecision` (ITM-785) under the person's account. For a
person who does not hold the deciding role or did the work, *Pass gate* stays unavailable with the role and its holders
named. The route's other parts — inputs, log, *Cancel*, *Retry* — belong to UC-036 and are not part of it.

## Acceptance

- A holder of the deciding role passes a fixture gate with one click, and the record names them; the implementer's own
  *Pass gate* is unavailable; *Reject* needs a reason.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
