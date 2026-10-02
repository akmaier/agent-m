---
id: ITM-032
title: The Definition of Done and the job check a pull request must pass
kind: implementation
level: 1
realises:
  - A PRODUCT DECLARES ITS DEFINITION OF DONE
  - THE DEFAULT DEFINITION OF DONE IS THE JOB RULES
  - A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS
  - AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST
  - A REFACTORING JOB BEGINS WITHOUT A FAILING TEST
  - A REFACTORING JOB CHANGES NO EXPECTED RESULT
  - AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES
modules:
  - MOD-process-model
depends_on:
  - ITM-030
  - ITM-011
origin: backlog refinement 2026-10-01
---
# ITM-032 The Definition of Done and the job check a pull request must pass

**REGISTER**

## Outcome

`definitionOfDone(declaration)` and `doneCheck({ conditions, job, commits, runs, changedFiles, headers, gates })`: the first commit tests only and red (refactoring: green throughout with no changed expectation), every changed file naming one of the job's modules, every gate before the merge recorded, and the product's own conditions — each failed condition named. The CI step that runs it is ITM-060.

## Realises

- `A PRODUCT DECLARES ITS DEFINITION OF DONE`
- `THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`
- `A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS`
- `AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`
- `A REFACTORING JOB BEGINS WITHOUT A FAILING TEST`
- `A REFACTORING JOB CHANGES NO EXPECTED RESULT`
- `AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-process-model `definitionOfDone`, `doneCheck`; ARC-015 decision 5.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-019.

## Modules

- MOD-process-model (kernel) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/process-model/done.mjs` (new)
- `tests/test_definition_of_done.py`
- `tests/test_implementation_job.py`
- `tests/fixtures/job-branches/`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_definition_of_done.py` — `A PRODUCT DECLARES ITS DEFINITION OF DONE`; `THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`; `A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS`
- `tests/test_implementation_job.py` — `AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`; `A REFACTORING JOB BEGINS WITHOUT A FAILING TEST`; `A REFACTORING JOB CHANGES NO EXPECTED RESULT`; `AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`

## Acceptance criteria

From the SPEC's checks:

- `A PRODUCT DECLARES ITS DEFINITION OF DONE` — `tests/test_definition_of_done.py`
- `THE DEFAULT DEFINITION OF DONE IS THE JOB RULES` — `tests/test_definition_of_done.py`
- `A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS` — `tests/test_definition_of_done.py` — a pull request missing one condition is not mergeable; counter-proof: with all conditions met it is.
- `AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST` — `tests/test_implementation_job.py` — reads the job branch's first commit and its CI result.
- `A REFACTORING JOB BEGINS WITHOUT A FAILING TEST` — `tests/test_implementation_job.py` — a refactoring job with a red run on any commit is refused; counter-proof: green on every commit passes.
- `A REFACTORING JOB CHANGES NO EXPECTED RESULT` — `tests/test_implementation_job.py` — a refactoring pull request that changes an asserted value fails; counter-proof: one that only moves a test passes.
- `AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES` — `tests/test_implementation_job.py`

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-030 — the declaration holds the Definition of Done
- ITM-011 — module and guard lines of changed files

## Needs a person

No.
