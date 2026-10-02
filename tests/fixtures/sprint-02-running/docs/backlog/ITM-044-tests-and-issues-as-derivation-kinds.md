---
id: ITM-044
title: Tests and issues as derivation kinds — the existing battery in the input, an issue triaged as bug or change
kind: implementation
level: 1
realises:
  - TEST GENERATION SEES THE EXISTING TESTS
  - EVOLUTION ENTERS THROUGH THE SPECIFICATION
  - UC-012
modules:
  - MOD-derivation
depends_on:
  - ITM-041
origin: backlog refinement 2026-10-01
---
# ITM-044 Tests and issues as derivation kinds — the existing battery in the input, an issue triaged as bug or change

**REGISTER**

## Outcome

For test generation: every existing test guarding the selection is in the input, and a case equal in guarded identifier, input and expected result is a duplicate whatever the participant said. For an issue: the requirements, use cases and tests it touches are in the input, and a *change* becomes a queue entry naming the issue before any code job may start. Job definitions `generate-tests` and `analyse-issue`.

## Realises

- `TEST GENERATION SEES THE EXISTING TESTS`
- `EVOLUTION ENTERS THROUGH THE SPECIFICATION`
- UC-012 — Handle an issue — bug fix or specification change

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-derivation (UC-012 triage, UC-026 input).

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-007.

## Modules

- MOD-derivation (features) — uses MOD-artifacts, MOD-job-harness, MOD-review-core, MOD-source-library, MOD-traceability

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/derivation/tests-and-issues.mjs` (new)
- `docs/assets/jobs/generate-tests/`
- `docs/assets/jobs/analyse-issue/`
- `tests/test_test_generation_context.py`
- `tests/test_issue_to_spec.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_issue_to_spec.py` — `EVOLUTION ENTERS THROUGH THE SPECIFICATION`
- `tests/test_test_generation_context.py` — `TEST GENERATION SEES THE EXISTING TESTS`

## Acceptance criteria

From the SPEC's checks:

- `TEST GENERATION SEES THE EXISTING TESTS` — `tests/test_test_generation_context.py`
- `EVOLUTION ENTERS THROUGH THE SPECIFICATION` — `tests/test_issue_to_spec.py`

From the postcondition of UC-012 (Handle an issue — bug fix or specification change), for the part this item builds:

> - A bug is fixed with a regression test that guards it from now on; the specification is unchanged.
> - A change is in the specification before any code implements it, and the accepted entry names the
>   issue it came from.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-041 — derivationInputs

## Needs a person

No.
