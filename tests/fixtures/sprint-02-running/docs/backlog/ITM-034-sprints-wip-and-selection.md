---
id: ITM-034
title: Sprints, item states, the work-in-progress limit and the sprint's selection
kind: implementation
level: 1
realises:
  - NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT
  - A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT
  - AGILE IMPLEMENTATION STARTS FROM THE BACKLOG
modules:
  - MOD-work-items
depends_on:
  - ITM-033
  - ITM-027
origin: backlog refinement 2026-10-01
---
# ITM-034 Sprints, item states, the work-in-progress limit and the sprint's selection

**REGISTER**

## Outcome

`sprint(text)` and `itemState(item, …)`: waiting for acceptance, ready, in progress (a job running or a pull request open, an item in review included), blocked, done; a start is refused above the WIP limit with the limit named, outside the current sprint's selection, or for an item a pulled model has not in its backlog.

## Realises

- `NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT`
- `A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT`
- `AGILE IMPLEMENTATION STARTS FROM THE BACKLOG`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-work-items `sprint`, `itemState`.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-019.

## Modules

- MOD-work-items (kernel) — uses MOD-process-model, MOD-review-core

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/work-items/flow.mjs` (new)
- `tests/test_wip_limit.py`
- `tests/test_time_box_selection.py`
- `tests/test_job_from_backlog.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_job_from_backlog.py` — `AGILE IMPLEMENTATION STARTS FROM THE BACKLOG`
- `tests/test_time_box_selection.py` — `A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT`
- `tests/test_wip_limit.py` — `NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT`

## Acceptance criteria

From the SPEC's checks:

- `NO JOB STARTS ABOVE THE WORK-IN-PROGRESS LIMIT` — `tests/test_wip_limit.py`. With limit 2 and two items in progress, a third start is refused with the limit named. With one of the two done, the start succeeds.
- `A TIME BOX WORKS ONLY ON WHAT WAS SELECTED FOR IT` — `tests/test_time_box_selection.py`
- `AGILE IMPLEMENTATION STARTS FROM THE BACKLOG` — `tests/test_job_from_backlog.py`. Starting an implementation job without an item is refused for a Scrum and a Kanban fixture.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-033 — items
- ITM-027 — `parseModel`: the flow control (WIP limit, sprints) the caller passes in as `wip` (*From the sprint 02 planning*)

## Needs a person

No.

## Notes

Agent M's own adapted model `scrum-wip` has a WIP limit of 4 and sprints with a selection but no time box; the SPEC's selection rule speaks of time boxes — see the change requests.

## From the sprint 02 planning

Checked at planning: `itemState(item, { requirements, useCases, jobs, pullRequests, wip })` takes the limit as an
input (MOD-work-items, *Interfaces*); the limit stands in the model definition's *Flow control* table, which
`parseModel` (ITM-027) reads. The declaration's `parseDeclaration` and `deriveWorkflow` (ITM-030, behind ITM-028 and
ITM-029) are not needed for it, so the dependency on ITM-030 is replaced by ITM-027. The caller in this sprint is
ITM-147, the first slice of the process dashboard.
