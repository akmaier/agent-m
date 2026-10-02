---
id: ITM-036
title: Closing a sprint — review of the increment, retrospective, a close delegated to a participant
kind: implementation
level: 1
realises:
  - A SPRINT ENDS WITH A REVIEW OF ITS INCREMENT
  - A SPRINT ENDS WITH A RETROSPECTIVE
  - CLOSING A SPRINT CAN BE ASSIGNED TO A PARTICIPANT
  - AN AGENT'S REVIEW NAMES WHERE ITS FEEDBACK CAME FROM
  - AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF
  - UC-041
modules:
  - MOD-work-items
depends_on:
  - ITM-034
origin: backlog refinement 2026-10-01
---
# ITM-036 Closing a sprint — review of the increment, retrospective, a close delegated to a participant

**REGISTER**

## Outcome

`sprintClose(sprint, input, closer)` returns the review and retrospective as one record, feedback as new items and moved unfinished items; refused without a retrospective entry; an agent's review names its sources and says that no stakeholder took part unless one did; changes to the model, the Definition of Done or a participant's instructions come back as proposals, never as files. The job definition of an agent's close.

## Realises

- `A SPRINT ENDS WITH A REVIEW OF ITS INCREMENT`
- `A SPRINT ENDS WITH A RETROSPECTIVE`
- `CLOSING A SPRINT CAN BE ASSIGNED TO A PARTICIPANT`
- `AN AGENT'S REVIEW NAMES WHERE ITS FEEDBACK CAME FROM`
- `AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF`
- UC-041 — Close a sprint with review and retrospective

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-work-items `sprintClose`.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-019.

## Modules

- MOD-work-items (kernel) — uses MOD-process-model, MOD-review-core

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/work-items/close.mjs` (new)
- `docs/assets/jobs/close-sprint/` (new)
- `tests/test_time_box_close.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_time_box_close.py` — `A SPRINT ENDS WITH A REVIEW OF ITS INCREMENT`; `A SPRINT ENDS WITH A RETROSPECTIVE`; `CLOSING A SPRINT CAN BE ASSIGNED TO A PARTICIPANT`; `AN AGENT'S REVIEW NAMES WHERE ITS FEEDBACK CAME FROM`; `AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF`

## Acceptance criteria

From the SPEC's checks:

- `A SPRINT ENDS WITH A REVIEW OF ITS INCREMENT` — `tests/test_time_box_close.py`
- `A SPRINT ENDS WITH A RETROSPECTIVE` — `tests/test_time_box_close.py`
- `CLOSING A SPRINT CAN BE ASSIGNED TO A PARTICIPANT` — `tests/test_time_box_close.py` — a sprint whose close is assigned to an agent fixture is closed with a review and a retrospective recorded by that agent.
- `AN AGENT'S REVIEW NAMES WHERE ITS FEEDBACK CAME FROM` — `tests/test_time_box_close.py` — a review by an agent without stakeholder input says so; counter- proof: a review listing a stakeholder names where their feedback is recorded.
- `AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF` — `tests/test_time_box_close.py` — after an agent's retrospective, the model, the Definition of Done and the participants are byte-identical, and the proposed changes are open for acceptance.

From the postcondition of UC-041 (Close a sprint with review and retrospective), for the part this item builds:

> - The product repository holds, for the sprint, one record with the review of its increment and the
>   retrospective; feedback is in the backlog as items that name what they realise.
> - Every selected item is either done, back in the backlog, or selected for the next sprint.
> - With a sprint branch, the increment is in the default branch only if the Product Owner merged it.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-034 — sprints and item states

## Needs a person

No.
