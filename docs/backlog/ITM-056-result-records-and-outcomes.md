---
id: ITM-056
title: Result records on the branch test-results, outcomes per commit, flaky tests
kind: implementation
level: 1
realises:
  - EVERY TEST RUN LEAVES A RESULT RECORD
  - TEST RESULTS ARE KEPT IN THE REPOSITORY
  - A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
  - UC-028
modules:
  - MOD-test-records
depends_on:
  - ITM-054
  - ITM-011
origin: backlog refinement 2026-10-01
---
# ITM-056 Result records on the branch test-results, outcomes per commit, flaky tests

**REGISTER**

## Outcome

`resultRecord`, `fromJUnit` and `commitOutcomes` of MOD-test-records: per level *not run on this commit* where no record exists, *flaky* for a deterministic test with both outcomes on one commit, model-dependent tests as rates; a run with uncommitted changes is marked and does not count.

## Realises

- `EVERY TEST RUN LEAVES A RESULT RECORD`
- `TEST RESULTS ARE KEPT IN THE REPOSITORY`
- `A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY`
- UC-028 — Run and review the tests of a commit

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-test-records; ARC-015 decision 4.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-015, ARC-016, ARC-017.

## Modules

- MOD-test-records (features) — uses MOD-artifacts, MOD-review-core, MOD-traceability

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/test-records.mjs` (new)
- `tests/test_result_records.py`
- `tests/review-core.d/flaky.test.mjs`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY`
- `tests/test_result_records.py` — `EVERY TEST RUN LEAVES A RESULT RECORD`; `TEST RESULTS ARE KEPT IN THE REPOSITORY`

## Acceptance criteria

From the SPEC's checks:

- `EVERY TEST RUN LEAVES A RESULT RECORD` — `tests/test_result_records.py`
- `TEST RESULTS ARE KEPT IN THE REPOSITORY` — `tests/test_result_records.py`
- `A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY` — `tests/review-core.test.mjs`

From the postcondition of UC-028 (Run and review the tests of a commit), for the part this item builds:

> - Every run started here left a result record on the branch `test-results`, naming the commit, the levels, the participant, the
>   date and each test's outcome.
> - The reviewer has seen, for this commit, which tests passed, failed, flipped or have not run.
> - For a release candidate, every test at every level has run, and the release test report is in the
>   product repository, open or accepted.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-054 — appendRecords
- ITM-011 — test headers

## Needs a person

No.
