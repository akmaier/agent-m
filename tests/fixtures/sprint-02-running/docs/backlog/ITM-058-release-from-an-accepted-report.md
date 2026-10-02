---
id: ITM-058
title: A release from an accepted release test report — version, report, changelog, tag on the tested commit
kind: implementation
level: 1
realises:
  - CALENDAR VERSIONS
  - EVERY PRODUCT HAS ITS OWN VERSION LINE
  - A RELEASE IS TAGGED AND LOGGED
  - A RELEASE RUNS EVERY TEST AT EVERY LEVEL
  - THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON
  - ACCEPTING THE RELEASE TEST REPORT RELEASES
  - A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED
  - UC-013
modules:
  - MOD-test-records
depends_on:
  - ITM-056
  - ITM-022
  - ITM-054
origin: backlog refinement 2026-10-01
---
# ITM-058 A release from an accepted release test report — version, report, changelog, tag on the tested commit

**REGISTER**

## Outcome

`nextVersion`, `releaseReport` and `acceptRelease` of MOD-test-records: one commit with report, approval record and changelog entry, then the tag on the tested commit; a failing test or worse rate without a recorded reason, a test that did not run, or an existing tag stops it, named.

## Realises

- `CALENDAR VERSIONS`
- `EVERY PRODUCT HAS ITS OWN VERSION LINE`
- `A RELEASE IS TAGGED AND LOGGED`
- `A RELEASE RUNS EVERY TEST AT EVERY LEVEL`
- `THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON`
- `ACCEPTING THE RELEASE TEST REPORT RELEASES`
- `A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED`
- UC-013 — Release a version

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-test-records (takes over the withdrawn MOD-release); ARC-017.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-015, ARC-016, ARC-017.

## Modules

- MOD-test-records (features) — uses MOD-artifacts, MOD-review-core, MOD-traceability

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/test-records/release.mjs` (new)
- `tests/test_version_format.py`
- `tests/test_version_independence.py`
- `tests/test_release_artifacts.py`
- `tests/test_release_run.py`
- `tests/review-core.d/release-report.test.mjs`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON`
- `tests/test_release_artifacts.py` — `A RELEASE IS TAGGED AND LOGGED`
- `tests/test_release_run.py` — `A RELEASE RUNS EVERY TEST AT EVERY LEVEL`; `ACCEPTING THE RELEASE TEST REPORT RELEASES`; `A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED`
- `tests/test_version_format.py` — `CALENDAR VERSIONS`
- `tests/test_version_independence.py` — `EVERY PRODUCT HAS ITS OWN VERSION LINE`

## Acceptance criteria

From the SPEC's checks:

- `CALENDAR VERSIONS` — `tests/test_version_format.py`
- `EVERY PRODUCT HAS ITS OWN VERSION LINE` — `tests/test_version_independence.py`
- `A RELEASE IS TAGGED AND LOGGED` — `tests/test_release_artifacts.py`
- `A RELEASE RUNS EVERY TEST AT EVERY LEVEL` — `tests/test_release_run.py`
- `THE RELEASE TEST REPORT IS ACCEPTED BY A PERSON` — `tests/review-core.test.mjs`
- `ACCEPTING THE RELEASE TEST REPORT RELEASES` — `tests/test_release_run.py` — after accepting a green report the tag exists on the tested commit; counter-proof: rejecting it sets no tag.
- `A RED RELEASE IS ACCEPTED ONLY WITH ITS LIMITATIONS RECORDED` — `tests/test_release_run.py` — a red run without a recorded limitation cannot be tagged; counter-proof: with one it can.

From the postcondition of UC-013 (Release a version), for the part this item builds:

> - The release is recoverable by its tag and described in the changelog.
> - The tagged commit is exactly the one on which the complete suite ran at every level — green, or
>   accepted with its limitations recorded (3a); the evidence per requirement is kept with the
>   release.
> - No other product's version changed.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-056 — outcomes
- ITM-022 — audit rows
- ITM-054 — tags

## Needs a person

No.
