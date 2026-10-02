---
id: ITM-033
title: Backlog items, their order, and an item from an issue
kind: implementation
level: 1
realises:
  - THE BACKLOG LIVES IN THE PRODUCT REPOSITORY
  - A BACKLOG ITEM NAMES WHAT IT REALISES
  - UC-032
  - UC-033
modules:
  - MOD-work-items
depends_on:
  - ITM-004
origin: backlog refinement 2026-10-01
---
# ITM-033 Backlog items, their order, and an item from an issue

**REGISTER**

## Outcome

`parseItem`, `itemProblems`, `backlogOrder` and `itemFromIssue` of MOD-work-items over `docs/backlog/ITM-<nnn>-<slug>.md` and the order file, in the format of this very backlog; the job definition that drafts items for uncovered requirements (UC-032 step 2). Agent M's own `docs/backlog/` parses without a problem.

## Realises

- `THE BACKLOG LIVES IN THE PRODUCT REPOSITORY`
- `A BACKLOG ITEM NAMES WHAT IT REALISES`
- UC-032 — Maintain the backlog
- UC-033 — Move an issue into the backlog

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-work-items `parseItem`, `itemProblems`, `backlogOrder`, `itemFromIssue`.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-019.

## Modules

- MOD-work-items (kernel) — uses MOD-process-model, MOD-review-core

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/work-items.mjs` (new)
- `docs/assets/jobs/propose-backlog-items/` (new)
- `tests/test_backlog_layout.py`
- `tests/test_backlog_item_fields.py`
- `tests/fixtures/backlog/`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_backlog_item_fields.py` — `A BACKLOG ITEM NAMES WHAT IT REALISES`
- `tests/test_backlog_layout.py` — `THE BACKLOG LIVES IN THE PRODUCT REPOSITORY`

## Acceptance criteria

From the SPEC's checks:

- `THE BACKLOG LIVES IN THE PRODUCT REPOSITORY` — `tests/test_backlog_layout.py`
- `A BACKLOG ITEM NAMES WHAT IT REALISES` — `tests/test_backlog_item_fields.py`

From the postcondition of UC-032 (Maintain the backlog), for the part this item builds:

> - The product repository holds its backlog as one Markdown file per item, plus an order and, in
>   Scrum, the sprint selections. No state is stored in them. State is derived from approvals, jobs
>   and pull requests.
> - Every item names what it realises and where it came from.

From the postcondition of UC-033 (Move an issue into the backlog), for the part this item builds:

> - The backlog holds an item that names the issue as its origin, and what it realises.
> - The issue names the item.
> - No implementation job can start for a change item before its specification change is accepted.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-004 — test-file conventions

## Needs a person

No.
