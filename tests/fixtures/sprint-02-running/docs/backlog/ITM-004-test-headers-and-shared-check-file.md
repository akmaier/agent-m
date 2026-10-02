---
id: ITM-004
title: Every existing test names its module, what it guards and its level; the shared check file runs a folder
kind: refactoring
level: 1
realises:
  - EVERY ARTIFACT NAMES ITS ORIGIN
  - EVERY TEST HAS ONE LEVEL
modules:
  - MOD-review-core
  - MOD-git-host
  - MOD-settings-store
  - MOD-bridge-tunnel
  - MOD-artifacts
  - MOD-traceability
  - MOD-pseudonymiser
  - MOD-dashboard-app
depends_on:
  - ITM-003
origin: backlog refinement 2026-10-01
---
# ITM-004 Every existing test names its module, what it guards and its level; the shared check file runs a folder

**REGISTER**

## Outcome

Every existing test file carries among its first 20 lines `Module: MOD-<slug>`, `Guards: <NAME>[; <NAME> …]` with the requirement names its docstring already cites, and `Level: unit|component|system` (ARC-020 decision 2); a file that tests several modules is split by module, with no assertion changed. `tests/review-core.test.mjs` — the check that SPEC.md names for about thirty requirements of eight modules — additionally runs every file of `tests/review-core.d/`, so that later items add their checks as files of their own there instead of all editing one file.

## Realises

- `EVERY ARTIFACT NAMES ITS ORIGIN`
- `EVERY TEST HAS ONE LEVEL`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — ARC-020 decision 2; ARC-016 decision 1.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-004, ARC-005, ARC-006, ARC-007, ARC-013, ARC-014, ARC-020.

## Modules

- MOD-review-core (kernel) — uses MOD-artifacts
- MOD-git-host (adapters) — uses no other module
- MOD-settings-store (adapters) — uses no other module
- MOD-bridge-tunnel (adapters) — uses no other module
- MOD-artifacts (kernel) — uses no other module
- MOD-traceability (kernel) — uses MOD-artifacts, MOD-review-core
- MOD-pseudonymiser (features) — uses MOD-job-harness
- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `tests/*.test.mjs`
- `tests/test_*.py`
- `tests/review-core.d/` (new folder)

## Kind and level

- Job kind: **refactoring** — CI green on every commit, no expected result changed (`A REFACTORING JOB BEGINS WITHOUT A FAILING TEST`, `A REFACTORING JOB CHANGES NO EXPECTED RESULT`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_origin_links.py` — `EVERY ARTIFACT NAMES ITS ORIGIN`
- `tests/test_test_levels.py` — `EVERY TEST HAS ONE LEVEL`

## Acceptance criteria

From the SPEC's checks:

- `EVERY ARTIFACT NAMES ITS ORIGIN` — `tests/test_origin_links.py`
- `EVERY TEST HAS ONE LEVEL` — `tests/test_test_levels.py`

Further:

- Every test green before is green after; no assertion changed.
- A file placed in `tests/review-core.d/` with a failing assertion makes `node --test tests/review-core.test.mjs` red (counter-proof).
- No test file names two modules.
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-003 — edits the header lines of the test files ITM-003 left in place

## Needs a person

No.

## Notes

The folder is a stopgap for the change request on the SPEC's check fields (ARC-016 decision 1 moves those tests to per-module files; the SPEC still names `tests/review-core.test.mjs`).
