---
id: ITM-1009
title: A retry whose item is no longer startable names the reason and starts nothing
level: module
realises:
  - UC-036
  - A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT
  - NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT
modules:
  - MOD-main-page
builds_on:
  - ITM-974
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-036-8, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1009 A retry whose item is no longer startable names the reason and starts nothing

**REGISTER**

## Outcome

UC-036-inspect-running-jobs.md:153-154 (7a): "The retried job's item is no longer startable, for example because the sprint
ended or the WIP limit is reached. Agent M names the reason and starts nothing (UC-034, step 2)."

## The accepted text

The draft for this item is accepted (`1c30ad0b` and the acceptances before it); quoted from `main` at 40e04d8d:

MOD-main-page.md:119-121:

> (`revertAfterCancel`); *Retry* for a failed, cancelled or ended job whose step or item is still startable
>     (MOD-work-plans' `startable` — otherwise the reasons are shown and nothing is queued, UC-036 7a), as a new job, with the same participant or another holder of its role on a route offered for it; for a job waiting
>     at a gate, the gate — what it checks, what to examine, who decides — and, for a person who may decide it, *Pass gate* …

## Acceptance

- A retry of a job whose item left its sprint, or whose role assignment is at its WIP limit, names the reason and writes
  nothing; counter-proof: a startable item is retried.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
