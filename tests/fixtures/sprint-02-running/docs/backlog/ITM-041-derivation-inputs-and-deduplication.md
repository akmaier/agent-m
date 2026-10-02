---
id: ITM-041
title: Derivation inputs and the deduplication pass for requirements
kind: implementation
level: 1
realises:
  - DERIVATION SEES THE EXISTING REQUIREMENTS
  - A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT
  - EXACT DUPLICATES ARE FOUND WITHOUT A MODEL
  - CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES
  - A CONFLICT IS DECIDED BY A PERSON
  - A PROMPTED REQUIREMENT CHANGE FOLLOWS THE DERIVATION RULES
modules:
  - MOD-derivation
depends_on:
  - ITM-023
  - ITM-009
  - ITM-046
origin: backlog refinement 2026-10-01
---
# ITM-041 Derivation inputs and the deduplication pass for requirements

**REGISTER**

## Outcome

`derivationInputs(kind, snapshot, selection)` (refused when the source's hash differs or the context does not fit), `mergeCandidates` and `classifyCandidates` of MOD-derivation for requirements from a source and by prompt.

## Realises

- `DERIVATION SEES THE EXISTING REQUIREMENTS`
- `A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT`
- `EXACT DUPLICATES ARE FOUND WITHOUT A MODEL`
- `CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES`
- `A CONFLICT IS DECIDED BY A PERSON`
- `A PROMPTED REQUIREMENT CHANGE FOLLOWS THE DERIVATION RULES`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-derivation; ARC-007 decision 5.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-007.

## Modules

- MOD-derivation (features) — uses MOD-artifacts, MOD-job-harness, MOD-review-core, MOD-source-library, MOD-traceability

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/derivation.mjs` (new)
- `tests/test_derivation_context.py`
- `tests/test_derivation_classes.py`
- `tests/fixtures/derivation/`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_derivation_classes.py` — `A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT`; `EXACT DUPLICATES ARE FOUND WITHOUT A MODEL`; `CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES`; `A CONFLICT IS DECIDED BY A PERSON`; `A PROMPTED REQUIREMENT CHANGE FOLLOWS THE DERIVATION RULES`
- `tests/test_derivation_context.py` — `DERIVATION SEES THE EXISTING REQUIREMENTS`; `A PROMPTED REQUIREMENT CHANGE FOLLOWS THE DERIVATION RULES`

## Acceptance criteria

From the SPEC's checks:

- `DERIVATION SEES THE EXISTING REQUIREMENTS` — `tests/test_derivation_context.py`
- `A CANDIDATE IS NEW, A CHANGE, A DUPLICATE OR A CONFLICT` — `tests/test_derivation_classes.py`
- `EXACT DUPLICATES ARE FOUND WITHOUT A MODEL` — `tests/test_derivation_classes.py`
- `CANDIDATES ARE DEDUPLICATED AMONG THEMSELVES` — `tests/test_derivation_classes.py`
- `A CONFLICT IS DECIDED BY A PERSON` — `tests/test_derivation_classes.py`
- `A PROMPTED REQUIREMENT CHANGE FOLLOWS THE DERIVATION RULES` — `tests/test_derivation_context.py` · `tests/test_derivation_classes.py`

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-023 — contextFits; extends tests/test_derivation_context.py
- ITM-009 — requirements
- ITM-046 — source links and hashes

## Needs a person

No.
