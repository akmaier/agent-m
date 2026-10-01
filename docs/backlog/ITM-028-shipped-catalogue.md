---
id: ITM-028
title: The shipped catalogue — the book's five process models and its practices as data
kind: implementation
level: 1
realises:
  - AGENT M CARRIES THE BOOK'S CATALOGUE
  - THE CATALOGUE IS DATA
  - UC-031
modules:
  - MOD-process-model
depends_on:
  - ITM-027
origin: backlog refinement 2026-10-01
---
# ITM-028 The shipped catalogue — the book's five process models and its practices as data

**REGISTER**

## Outcome

The five models of the book as Markdown data files in ARC-019's format — waterfall, V-model (UC-031's example table), reuse-oriented (discovery and evaluation side by side, back to the specification, configure/adapt/develop), Scrum (the file `docs/assets/process-models/scrum.md` that Agent M's own `docs/process-models/scrum-wip.md` adapts from) and Kanban (Backlog, Doing, Review, Done) — and the practices, each saying what it adds and to which models it fits. No model or practice name appears in Agent M's code.

## Realises

- `AGENT M CARRIES THE BOOK'S CATALOGUE`
- `THE CATALOGUE IS DATA`
- UC-031 — Configure a process model

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — ARC-019 decision 1; MOD-process-model.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-019.

## Modules

- MOD-process-model (kernel) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/process-models/waterfall.md`
- `docs/assets/process-models/v-model.md`
- `docs/assets/process-models/reuse-oriented.md`
- `docs/assets/process-models/scrum.md`
- `docs/assets/process-models/kanban.md`
- `docs/assets/process-models/practices/` (DevOps, prototyping, incremental delivery, scaling layers)
- `tests/test_catalogue_complete.py`
- `tests/test_catalogue_is_data.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_catalogue_complete.py` — `AGENT M CARRIES THE BOOK'S CATALOGUE`
- `tests/test_catalogue_is_data.py` — `THE CATALOGUE IS DATA`

## Acceptance criteria

From the SPEC's checks:

- `AGENT M CARRIES THE BOOK'S CATALOGUE` — `tests/test_catalogue_complete.py`
- `THE CATALOGUE IS DATA` — `tests/test_catalogue_is_data.py` — no model or practice name appears in Agent M's implementation.

From the postcondition of UC-031 (Configure a process model), for the part this item builds:

> - The instance holds a valid process model definition as data. Agent M's code is unchanged
>   (`THE CATALOGUE IS DATA`).
> - Products can choose the model in UC-002. For a *planned* model, their plan covers every accepted
>   requirement in every phase (UC-035). For a *pulled* model, their work comes from a backlog
>   (UC-032).

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-027 — every shipped model must pass validation

## Needs a person

A person who has the book checks every model's phases, roles and gates against *Vibe Coding* ch. 6, 7 and 14 at review; the agent writing the files cannot read the book.

## Notes

ARC-019 gives the format of a model; the format of a practice file is not fixed by the architecture and is decided in this item (an implementation detail, data in the same Markdown-table form). Whether the Scrum *Product Owner* role is filled by a person or by either is a decision this file makes — see the change request on UC-032's precondition: Agent M's own declaration assigns an agent.
