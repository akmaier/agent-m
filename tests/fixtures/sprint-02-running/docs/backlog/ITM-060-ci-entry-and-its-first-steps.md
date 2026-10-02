---
id: ITM-060
title: The CI entry — one shell for every workflow step, on the ci-secret authority; apply-approvals, results, done
kind: implementation
level: 1
realises:
  - WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE
  - EVERY TEST RUN LEAVES A RESULT RECORD
  - A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS
  - UC-010
modules:
  - MOD-ci-entry
depends_on:
  - ITM-008
  - ITM-016
  - ITM-056
  - ITM-032
origin: backlog refinement 2026-10-01
---
# ITM-060 The CI entry — one shell for every workflow step, on the ci-secret authority; apply-approvals, results, done

**REGISTER**

## Outcome

`ciEntry(step, env)`: a dispatcher that loads `tools/ci-entry/<step>.mjs`, builds the git host on the `ci-secret` authority from the named secret, and hands adapters to the kernel and features as ports. Steps `apply-approvals`, `results` (JUnit to a result record appended to `test-results`) and `done` (the Definition of Done check).

## Realises

- `WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE`
- `EVERY TEST RUN LEAVES A RESULT RECORD`
- `A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS`
- UC-010 — Run a job in GitHub Actions

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-ci-entry; ARC-003 decision 1 (shells), ARC-015 decisions 4, 5, 7.

Architecture decisions its modules follow: ARC-003, ARC-010, ARC-015.

## Modules

- MOD-ci-entry (shells) — uses MOD-artifacts, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-participants, MOD-process-model, MOD-review-core, MOD-run-engine, MOD-source-library, MOD-test-records

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `tools/ci-entry.mjs` (new)
- `tools/ci-entry/apply-approvals.mjs` (new)
- `tools/ci-entry/results.mjs` (new)
- `tools/ci-entry/done.mjs` (new)
- `tests/ci-entry.test.mjs` (new)
- `tests/test_result_records.py`
- `tests/test_definition_of_done.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_apply_approvals.py` — `WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE`
- `tests/test_definition_of_done.py` — `A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS`
- `tests/test_result_records.py` — `EVERY TEST RUN LEAVES A RESULT RECORD`

## Acceptance criteria

From the SPEC's checks:

- `WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE` — `tests/test_apply_approvals.py`
- `EVERY TEST RUN LEAVES A RESULT RECORD` — `tests/test_result_records.py`
- `A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS` — `tests/test_definition_of_done.py` — a pull request missing one condition is not mergeable; counter-proof: with all conditions met it is.

From the postcondition of UC-010 (Run a job in GitHub Actions), for the part this item builds:

> - The artifacts are of the same kind the browser runtime would produce.
> - Nothing counts as accepted before a person accepts it on the dashboard.

Further:

- A step run without the secret writes nothing (counter-proof of every write being on the `ci-secret` authority).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-008 — the ci-secret authority
- ITM-016 — applyApprovals
- ITM-056 — result records; extends tests/test_result_records.py
- ITM-032 — doneCheck; extends tests/test_definition_of_done.py

## Needs a person

No.
