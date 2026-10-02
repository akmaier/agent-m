---
id: ITM-017
title: Retire tools/apply_approvals.py — the apply workflow runs the CI entry
kind: refactoring
level: 1
realises:
  - WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE
  - ONE DEFINITION, THREE DRIVERS
modules:
  - MOD-review-core
  - MOD-ci-entry
depends_on:
  - ITM-016
  - ITM-060
origin: backlog refinement 2026-10-01
---
# ITM-017 Retire tools/apply_approvals.py — the apply workflow runs the CI entry

**REGISTER**

## Outcome

`.github/workflows/apply-approvals.yml` runs `MOD-ci-entry.ciEntry("apply-approvals")`; `tools/apply_approvals.py` is removed. The workflow's tests keep their expectations and run against the JavaScript engine; the comparison test between the two implementations goes with the Python one.

## Realises

- `WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE`
- `ONE DEFINITION, THREE DRIVERS`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — ARC-003 alternatives ("replaced by a Node entry … in a later refactoring job"); MOD-review-core.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-010, ARC-015.

## Modules

- MOD-review-core (kernel) — uses MOD-artifacts
- MOD-ci-entry (shells) — uses MOD-artifacts, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-participants, MOD-process-model, MOD-review-core, MOD-run-engine, MOD-source-library, MOD-test-records

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `.github/workflows/apply-approvals.yml`
- `tools/apply_approvals.py` (removed)
- `tests/test_apply_approvals.py`

## Kind and level

- Job kind: **refactoring** — CI green on every commit, no expected result changed (`A REFACTORING JOB BEGINS WITHOUT A FAILING TEST`, `A REFACTORING JOB CHANGES NO EXPECTED RESULT`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_apply_approvals.py` — `WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE`
- `tests/test_single_definition.py` — `ONE DEFINITION, THREE DRIVERS`

## Acceptance criteria

From the SPEC's checks:

- `WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE` — `tests/test_apply_approvals.py`
- `ONE DEFINITION, THREE DRIVERS` — `tests/test_single_definition.py` — no prompt or schema text appears in more than one place.

Further:

- Every expectation of `tests/test_apply_approvals.py` holds unchanged against the new route.
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-016 — the JavaScript engine writes the same bytes
- ITM-060 — the CI entry has the apply-approvals step

## Needs a person

No.
