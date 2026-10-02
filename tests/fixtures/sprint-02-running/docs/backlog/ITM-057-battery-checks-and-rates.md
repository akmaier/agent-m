---
id: ITM-057
title: The checks a test battery must pass, and rates compared with the last release
kind: implementation
level: 1
realises:
  - A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
  - A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT
  - A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
  - RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER
  - UC-026
modules:
  - MOD-test-records
depends_on:
  - ITM-056
origin: backlog refinement 2026-10-01
---
# ITM-057 The checks a test battery must pass, and rates compared with the last release

**REGISTER**

## Outcome

`batteryProblems(tests, jobRecords)` and `rateComparison(current, lastRelease)` of MOD-test-records.

## Realises

- `A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS`
- `A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`
- `A MODEL-DEPENDENT TEST IS MEASURED AS A RATE`
- `RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`
- UC-026 — Generate a multi-level test battery

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-test-records.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-015, ARC-016, ARC-017.

## Modules

- MOD-test-records (features) — uses MOD-artifacts, MOD-review-core, MOD-traceability

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/test-records/battery.mjs` (new)
- `tests/test_test_battery.py`
- `tests/test_counter_proof.py`
- `tests/test_rate_reporting.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_counter_proof.py` — `A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`
- `tests/test_rate_reporting.py` — `A MODEL-DEPENDENT TEST IS MEASURED AS A RATE`
- `tests/test_test_battery.py` — `A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS`; `RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`

## Acceptance criteria

From the SPEC's checks:

- `A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS` — `tests/test_test_battery.py`
- `A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT` — `tests/test_counter_proof.py`
- `A MODEL-DEPENDENT TEST IS MEASURED AS A RATE` — `tests/test_rate_reporting.py`
- `RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER` — `tests/test_test_battery.py` — a release test whose recorded author equals the implementing participant of its guarded use case fails.

From the postcondition of UC-026 (Generate a multi-level test battery), for the part this item builds:

> - Every new test has a `TST-` identifier, one level, the identifiers it guards and an expected
>   result readable without running it.
> - Every new automated test has a recorded counter-proof, or is marked as awaiting implementation.
> - No new test duplicates an existing one; extensions name the test they extend.
> - The tests reach the default branch only through a pull request with green CI.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-056 — result records

## Needs a person

No.
