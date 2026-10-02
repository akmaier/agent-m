---
id: ITM-015
title: A SPEC edit becomes an entry of the author's open queue of today — renamed requirement withdrawn and added
kind: implementation
level: 1
realises:
  - A SPEC EDIT IS SAVED AS A PROPOSAL
  - A PERSON'S EDITS COLLECT IN ONE OPEN QUEUE
  - A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED
  - A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT
  - UC-018
modules:
  - MOD-review-core
depends_on:
  - ITM-009
  - ITM-004
origin: backlog refinement 2026-10-01
---
# ITM-015 A SPEC edit becomes an entry of the author's open queue of today — renamed requirement withdrawn and added

**REGISTER**

## Outcome

`MOD-review-core.proposeEdit({ spec, queues, section, edited, why, impact, author, today })` returns the files of one commit: the edited section as an entry of the author's newest queue of the day that has no accepted entry (or a new queue), with its rationale, its impact list and the index line naming the section it replaces; a second edit of the same section replaces that entry; a changed name becomes a withdrawal with its note plus a new requirement. `SPEC.md` is never among the files.

## Realises

- `A SPEC EDIT IS SAVED AS A PROPOSAL`
- `A PERSON'S EDITS COLLECT IN ONE OPEN QUEUE`
- `A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED`
- `A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT`
- UC-018 — Edit a specification or a use case in the dashboard

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-review-core `proposeEdit`.

Architecture decisions its modules follow: ARC-003, ARC-006.

## Modules

- MOD-review-core (kernel) — uses MOD-artifacts

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/review-core/propose-edit.mjs` (new)
- `tests/review-core.d/propose-edit.test.mjs`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `A SPEC EDIT IS SAVED AS A PROPOSAL`; `A PERSON'S EDITS COLLECT IN ONE OPEN QUEUE`; `A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED`; `A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT`

## Acceptance criteria

From the SPEC's checks:

- `A SPEC EDIT IS SAVED AS A PROPOSAL` — `tests/review-core.test.mjs` — a save from the editor leaves `SPEC.md` byte-identical.
- `A PERSON'S EDITS COLLECT IN ONE OPEN QUEUE` — `tests/review-core.test.mjs`
- `A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED` — `tests/review-core.test.mjs`
- `A DRAFTED CHANGE IS SHOWN AGAINST THE CURRENT TEXT` — `tests/review-core.test.mjs`

From the postcondition of UC-018 (Edit a specification or a use case in the dashboard), for the part this item builds:

> - A use case: the edited text is on the default branch and counts as open until an approval record
>   names its SHA (UC-008).
> - A requirement: a queue entry holds the edited section beside the current one; `SPEC.md` is
>   unchanged until the entry is accepted (UC-006).
> - No identifier changed; a renamed requirement left a withdrawal note behind.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-009 — reads requirements with parseRequirements
- ITM-004 — adds its checks under tests/review-core.d/

## Needs a person

No.
