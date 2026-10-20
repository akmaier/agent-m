---
id: ITM-1033
title: A Bridge starts its agent's sprint close when the sprint ends
level: module
realises:
  - UC-041
  - A SPRINT CLOSED BY AN AGENT STARTS BY ITSELF
modules:
  - MOD-bridge-jobs
builds_on:
  - ITM-1032
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-041-6, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1033 A Bridge starts its agent's sprint close when the sprint ends

**REGISTER**

## Outcome

MOD-bridge-jobs.md:121-123, `startWatching`: "a sprint whose close the product assigned to one of this Bridge's agents is
closed by that agent when its time box ends or every selected item is done". Not built: `src/bridge-jobs/watch.mjs:2-3`.

## The accepted text

The draft for this item is accepted (`1c30ad0b` and the acceptances before it); quoted from `main` at 40e04d8d:

MOD-bridge-jobs.md:127-130:

> records; a sprint whose close
>   the product assigned to one of this Bridge's agents is closed by that agent, once,
>   when MOD-work-plans' `sprintsToClose` names it — its time box ended, or, without one, every selected item done or
>   ended by the Product Owner. A product that cannot be read is skipped with its reason, and read again at the next interval.

## Acceptance

- Unit tests that name MOD-bridge-jobs: with a served fixture product whose sprint's `closer` is an agent this Bridge
  offers, a watch round after the time box's end runs `close-sprint` once; a sprint closed by another participant is left.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Its merge waits for draft `3f71e653` (sprint team2/97, po-opus-b).** `src/bridge-jobs` imports five interfaces that
MOD-bridge-jobs' uses do not name. #1184 adds one of them, `newJobId`. The draft names all five, and #1184 merges once an
approval record names the draft's blob.
