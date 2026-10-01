---
id: ITM-062
title: Agent M's own test schedule and its generated CI, with result records on its test-results branch
kind: implementation
level: 1
realises:
  - THE TEST SCHEDULE IS DECLARED PER PRODUCT
  - THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE
  - EVERY TEST RUN LEAVES A RESULT RECORD
  - TEST RESULTS ARE KEPT IN THE REPOSITORY
  - CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
modules:
  - MOD-ci-generator
  - MOD-ci-entry
depends_on:
  - ITM-059
  - ITM-060
  - ITM-063
origin: backlog refinement 2026-10-01
---
# ITM-062 Agent M's own test schedule and its generated CI, with result records on its test-results branch

**REGISTER**

## Outcome

Agent M declares its own schedule (the book's default unless the PO decides otherwise) and its CI is the configuration generated from it; a runner script passes the level to Agent M's test suites (ARC-015 decision 3); every run leaves a result record on Agent M's own `test-results` branch.

## Realises

- `THE TEST SCHEDULE IS DECLARED PER PRODUCT`
- `THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE`
- `EVERY TEST RUN LEAVES A RESULT RECORD`
- `TEST RESULTS ARE KEPT IN THE REPOSITORY`
- `CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — ARC-015, ARC-016 (Agent M is a product managed by itself).

Architecture decisions its modules follow: ARC-003, ARC-009, ARC-010, ARC-015.

## Modules

- MOD-ci-generator (features) — uses no other module
- MOD-ci-entry (shells) — uses MOD-artifacts, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-participants, MOD-process-model, MOD-review-core, MOD-run-engine, MOD-source-library, MOD-test-records

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/tests/schedule.md` (new)
- `.github/workflows/agent-m-tests.yml` (generated, new)
- `.github/workflows/tests.yml` (removed)
- `tools/run-tests.mjs` (new: runs node, Python, Deno and Playwright tests of one level)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_ci_schedule.py` — `THE TEST SCHEDULE IS DECLARED PER PRODUCT`; `THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE`
- `tests/test_result_records.py` — `EVERY TEST RUN LEAVES A RESULT RECORD`; `TEST RESULTS ARE KEPT IN THE REPOSITORY`
- guarded at review only: `CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI`

## Acceptance criteria

From the SPEC's checks:

- `THE TEST SCHEDULE IS DECLARED PER PRODUCT` — `tests/test_ci_schedule.py`
- `THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE` — `tests/test_ci_schedule.py` — the generated configuration triggers exactly the levels the schedule names for each event.
- `EVERY TEST RUN LEAVES A RESULT RECORD` — `tests/test_result_records.py`
- `TEST RESULTS ARE KEPT IN THE REPOSITORY` — `tests/test_result_records.py`
- `CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI` — no automatic check; at review. The repository's branch protection can enforce it.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-059 — the generator
- ITM-060 — the results step
- ITM-063 — replaces tests.yml after the Playwright job is in it

## Needs a person

The PO stores the Agent M token as an Actions secret of `akmaier/agent-m` (the dashboard names it and opens the page; nobody else can).
