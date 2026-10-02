---
id: ITM-095
title: Release a version, and audit the tests of a release
kind: implementation
level: 1
realises:
  - UC-013
  - UC-030
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-058
  - ITM-022
origin: backlog refinement 2026-10-01
---
# ITM-095 Release a version, and audit the tests of a release

**REGISTER**

## Outcome

UC-013 (version and changelog entry, *Start release candidate*, the panel of levels and rates, *Accept and release*, limitations for a red level) and UC-030 (rows per requirement, summary, filters, *Export*, *Commit export*).

## Realises

- UC-013 — Release a version
- UC-030 — Audit the tests of a release

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-dashboard-app (shell); the use cases it realises.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/release-view.mjs` (new)
- `docs/assets/dashboard/audit-view.mjs` (new)
- `tests/dashboard-release.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- none — it realises use cases only; its tests are the files listed above.

## Acceptance criteria


From the postcondition of UC-013 (Release a version), for the part this item builds:

> - The release is recoverable by its tag and described in the changelog.
> - The tagged commit is exactly the one on which the complete suite ran at every level — green, or
>   accepted with its limitations recorded (3a); the evidence per requirement is kept with the
>   release.
> - No other product's version changed.

From the postcondition of UC-030 (Audit the tests of a release), for the part this item builds:

> - The auditor holds, for one release, the evidence per requirement and every gap, as one Markdown
>   document that can be checked against the repository without Agent M.
> - Nothing was written, unless the export was committed on a person's click.

Further:

- Every decision on the page takes one click once its inputs are complete (`ONE CLICK PER DECISION`, checked at review); every step carries a folded *What is this?* written for someone new to GitHub (`EVERY STEP EXPLAINS ITSELF`); every person-facing text lives in the dashboard (ARC-003 decision 5).
- Its tests run the real view in `tests/app-harness.mjs` against fakes the test file brings itself; a write happens only on a trusted click (counter-proof with a synthetic click).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-058 — release
- ITM-022 — audit rows

## Needs a person

No.
