---
id: ITM-042
title: Candidates written as proposals — new entries, changes under the existing name, added sources, decided conflicts
kind: implementation
level: 1
realises:
  - A CHANGE IS PROPOSED UNDER THE EXISTING NAME
  - A DUPLICATE ADDS A SOURCE, NOT A REQUIREMENT
  - UC-005
modules:
  - MOD-derivation
depends_on:
  - ITM-041
  - ITM-015
  - ITM-018
origin: backlog refinement 2026-10-01
---
# ITM-042 Candidates written as proposals — new entries, changes under the existing name, added sources, decided conflicts

**REGISTER**

## Outcome

`toProposals(classified, decisions, ports)` writes one new queue: additions, changes with the current text and impact list, added sources, conflicts only as decided; every entry records Agent M version, participant, model and date. The job definition `derive-requirements`.

## Realises

- `A CHANGE IS PROPOSED UNDER THE EXISTING NAME`
- `A DUPLICATE ADDS A SOURCE, NOT A REQUIREMENT`
- UC-005 — Derive requirements from a source

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-derivation `toProposals`.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-007.

## Modules

- MOD-derivation (features) — uses MOD-artifacts, MOD-job-harness, MOD-review-core, MOD-source-library, MOD-traceability

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/derivation/proposals.mjs` (new)
- `docs/assets/jobs/derive-requirements/` (new)
- `tests/test_derivation_classes.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_derivation_classes.py` — `A CHANGE IS PROPOSED UNDER THE EXISTING NAME`; `A DUPLICATE ADDS A SOURCE, NOT A REQUIREMENT`

## Acceptance criteria

From the SPEC's checks:

- `A CHANGE IS PROPOSED UNDER THE EXISTING NAME` — `tests/test_derivation_classes.py`
- `A DUPLICATE ADDS A SOURCE, NOT A REQUIREMENT` — `tests/test_derivation_classes.py`

From the postcondition of UC-005 (Derive requirements from a source), for the part this item builds:

> - The product repository holds a queue of proposals; the SPEC itself is unchanged until entries are
>   accepted.
> - No proposal duplicates an existing requirement: what the source adds is new, what it alters is a
>   change under the existing name, what it repeats is an added source.
> - Each proposal names its source passage, the source version and the participant that produced it.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-041 — classified candidates; extends tests/test_derivation_classes.py
- ITM-015 — proposeEdit
- ITM-018 — requirementImpact

## Needs a person

No.
