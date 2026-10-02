---
id: ITM-016
title: applyApprovals in the approval engine — the same bytes as tools/apply_approvals.py
kind: implementation
level: 1
realises:
  - WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE
  - A STALE APPROVAL IS NOT APPLIED
  - UC-006
modules:
  - MOD-review-core
depends_on:
  - ITM-004
origin: backlog refinement 2026-10-01
---
# ITM-016 applyApprovals in the approval engine — the same bytes as tools/apply_approvals.py

**REGISTER**

## Outcome

`MOD-review-core.applyApprovals({ read, now })` returns what the instance's workflow writes for every `kind: spec` record not yet applied, with the checks and bytes of `planAcceptance`; a stale or malformed record is refused and named. A test runs it and `tools/apply_approvals.py` on the same records and requires byte-identical files and reports. The Python tool keeps running in the workflow until ITM-017.

## Realises

- `WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE`
- `A STALE APPROVAL IS NOT APPLIED`
- UC-006 — Approve a specification change

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-review-core `applyApprovals`; ARC-003 alternatives (the Python exception is replaced later).

Architecture decisions its modules follow: ARC-003, ARC-006.

## Modules

- MOD-review-core (kernel) — uses MOD-artifacts

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/review-core/apply-approvals.mjs` (new)
- `tests/test_apply_approvals.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `A STALE APPROVAL IS NOT APPLIED`
- `tests/test_apply_approvals.py` — `WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE`; `A STALE APPROVAL IS NOT APPLIED`

## Acceptance criteria

From the SPEC's checks:

- `WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE` — `tests/test_apply_approvals.py`
- `A STALE APPROVAL IS NOT APPLIED` — `tests/test_apply_approvals.py` · `tests/review-core.test.mjs`

From the postcondition of UC-006 (Approve a specification change), for the part this item builds:

> - The SPEC contains exactly the approved text.
> - The commit history shows who approved, when, and which text; the replaced text is reachable in
>   the history.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-004 — test-file conventions

## Needs a person

No.
