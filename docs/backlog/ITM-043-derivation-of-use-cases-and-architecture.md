---
id: ITM-043
title: The derivation rules for use cases and architecture — neighbours in the input, due diligence for reuse
kind: implementation
level: 1
realises:
  - THE DERIVATION RULES HOLD FOR ARCHITECTURE
  - A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS
  - UC-007
  - UC-022
  - UC-023
modules:
  - MOD-derivation
depends_on:
  - ITM-042
  - ITM-048
  - ITM-040
origin: backlog refinement 2026-10-01
---
# ITM-043 The derivation rules for use cases and architecture — neighbours in the input, due diligence for reuse

**REGISTER**

## Outcome

Inputs, classification and proposals for use cases (every other use case and the realised requirements in the input; a same goal becomes a change) and for decisions and modules (every existing one in the input, `ARC-<nnn>` assigned, a reuse decision written only with its fetched due diligence and licence check). Job definitions for deriving use cases, changing by prompt, deriving and describing architecture.

## Realises

- `THE DERIVATION RULES HOLD FOR ARCHITECTURE`
- `A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS`
- UC-007 — Derive use cases from requirements
- UC-022 — Derive the system architecture from requirements and use cases
- UC-023 — Modify the architecture

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-derivation; ARC-007.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-007.

## Modules

- MOD-derivation (features) — uses MOD-artifacts, MOD-job-harness, MOD-review-core, MOD-source-library, MOD-traceability

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/derivation/use-cases.mjs` (new)
- `docs/assets/derivation/architecture.mjs` (new)
- `docs/assets/jobs/derive-use-cases/`
- `docs/assets/jobs/change-by-prompt/`
- `docs/assets/jobs/derive-architecture/`
- `tests/test_derivation_classes.py`
- `tests/test_prompted_change_context.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_derivation_classes.py` — `THE DERIVATION RULES HOLD FOR ARCHITECTURE`
- `tests/test_prompted_change_context.py` — `A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS`

## Acceptance criteria

From the SPEC's checks:

- `THE DERIVATION RULES HOLD FOR ARCHITECTURE` — `tests/test_derivation_classes.py` — the same battery, with architecture fixtures.
- `A PROMPTED USE-CASE CHANGE SEES ITS NEIGHBOURS` — `tests/test_prompted_change_context.py`

From the postcondition of UC-007 (Derive use cases from requirements), for the part this item builds:

> - Each proposed use case is one Markdown file naming the requirements it realises.
> - None of them counts as accepted until UC-008.

From the postcondition of UC-022 (Derive the system architecture from requirements and use cases), for the part this item builds:

> - The product repository holds one open file per proposed decision and per proposed module under
>   `docs/architecture/`; nothing counts as accepted before a person accepts it.
> - No proposal duplicates an existing decision or module: changes stand under their existing
>   identifiers.
> - Every reuse decision carries a due diligence whose facts name where and when they were read.

From the postcondition of UC-023 (Modify the architecture), for the part this item builds:

> - The accepted text of every changed decision and module is named by an approval record; its old text
>   stays reachable in the git history.
> - The reviewer saw, before accepting, every module, code file, test and requirement the change
>   touches.
> - Code still reflects the old architecture until an implementation job changes it.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-042 — extends tests/test_derivation_classes.py
- ITM-048 — fetched due diligence
- ITM-040 — extends tests/test_prompted_change_context.py after it

## Needs a person

No.
