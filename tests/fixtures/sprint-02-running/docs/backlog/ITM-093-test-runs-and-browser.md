---
id: ITM-093
title: Tests → Runs of a commit, and Tests → Browser
kind: implementation
level: 1
realises:
  - UC-028
  - UC-029
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-056
  - ITM-018
  - ITM-055
origin: backlog refinement 2026-10-01
---
# ITM-093 Tests → Runs of a commit, and Tests → Browser

**REGISTER**

## Outcome

UC-028 (a commit's levels: passed, failed, flaky, not run; a failed test's expectation beside the observation; *Run on this commit*) and UC-029 (tree by level, requirement, use case or module; filters; a test's history; two releases compared).

## Realises

- UC-028 — Run and review the tests of a commit
- UC-029 — Browse the tests of a product

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-dashboard-app (shell); the use cases it realises.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/tests-runs-view.mjs` (new)
- `docs/assets/dashboard/tests-browser-view.mjs` (new)
- `tests/dashboard-tests-runs.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- none — it realises use cases only; its tests are the files listed above.

## Acceptance criteria


From the postcondition of UC-028 (Run and review the tests of a commit), for the part this item builds:

> - Every run started here left a result record on the branch `test-results`, naming the commit, the levels, the participant, the
>   date and each test's outcome.
> - The reviewer has seen, for this commit, which tests passed, failed, flipped or have not run.
> - For a release candidate, every test at every level has run, and the release test report is in the
>   product repository, open or accepted.

From the postcondition of UC-029 (Browse the tests of a product), for the part this item builds:

> - Nothing was written; the reviewer knows for any test what it guards, what it expects and how its
>   results developed, and for any requirement which levels guard it.

Further:

- Every decision on the page takes one click once its inputs are complete (`ONE CLICK PER DECISION`, checked at review); every step carries a folded *What is this?* written for someone new to GitHub (`EVERY STEP EXPLAINS ITSELF`); every person-facing text lives in the dashboard (ARC-003 decision 5).
- Its tests run the real view in `tests/app-harness.mjs` against fakes the test file brings itself; a write happens only on a trusted click (counter-proof with a synthetic click).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-056 — result records
- ITM-018 — what a test guards
- ITM-055 — starting a run

## Needs a person

No.
