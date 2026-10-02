---
id: ITM-059
title: A product's test schedule and the CI configuration generated from it — GitHub Actions and GitLab CI
kind: implementation
level: 1
realises:
  - THE TEST SCHEDULE IS DECLARED PER PRODUCT
  - THE DEFAULT SCHEDULE FOLLOWS THE BOOK
  - COMMIT TESTS CALL NO PAID SERVICE
  - THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE
  - A JOB RECORD STARTS NO CI RUN
  - UC-027
modules:
  - MOD-ci-generator
depends_on:
  - ITM-004
origin: backlog refinement 2026-10-01
---
# ITM-059 A product's test schedule and the CI configuration generated from it — GitHub Actions and GitLab CI

**REGISTER**

## Outcome

`parseSchedule`, `defaultSchedule` and `generateTestCi` of MOD-ci-generator: byte-identical generation; `docs/jobs/**` ignored; no trigger on `test-results`; the result-record and Definition-of-Done steps written as calls of `MOD-ci-entry.ciEntry`; on GitLab the nightly run as a pipeline schedule to create through the API.

## Realises

- `THE TEST SCHEDULE IS DECLARED PER PRODUCT`
- `THE DEFAULT SCHEDULE FOLLOWS THE BOOK`
- `COMMIT TESTS CALL NO PAID SERVICE`
- `THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE`
- `A JOB RECORD STARTS NO CI RUN`
- UC-027 — Configure continuous integration

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-ci-generator; ARC-015 decisions 1–3.

Architecture decisions its modules follow: ARC-003, ARC-009, ARC-010, ARC-015.

## Modules

- MOD-ci-generator (features) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/ci-generator.mjs` (new)
- `tests/test_ci_schedule.py`
- `tests/fixtures/schedules/`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_ci_schedule.py` — `THE TEST SCHEDULE IS DECLARED PER PRODUCT`; `THE DEFAULT SCHEDULE FOLLOWS THE BOOK`; `COMMIT TESTS CALL NO PAID SERVICE`; `THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE`; `A JOB RECORD STARTS NO CI RUN`

## Acceptance criteria

From the SPEC's checks:

- `THE TEST SCHEDULE IS DECLARED PER PRODUCT` — `tests/test_ci_schedule.py`
- `THE DEFAULT SCHEDULE FOLLOWS THE BOOK` — `tests/test_ci_schedule.py`
- `COMMIT TESTS CALL NO PAID SERVICE` — `tests/test_ci_schedule.py` — a commit-level test that opens a connection to a configured paid endpoint fails the run.
- `THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE` — `tests/test_ci_schedule.py` — the generated configuration triggers exactly the levels the schedule names for each event.
- `A JOB RECORD STARTS NO CI RUN` — `tests/test_ci_schedule.py` — the generated configuration ignores a push touching only `docs/jobs/`; counter-proof: a push also touching code starts a run.

From the postcondition of UC-027 (Configure continuous integration), for the part this item builds:

> - The product's repository holds the schedule and a CI configuration generated from it.
> - Every commit and pull request runs the levels ticked for them, without calls to paid services.
> - A release candidate runs every test at every level.
> - No secret value is in the repository or in Agent M; the needed secrets are named.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-004 — test-file conventions

## Needs a person

No.
