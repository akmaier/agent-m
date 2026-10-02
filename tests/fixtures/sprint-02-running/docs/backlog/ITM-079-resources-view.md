---
id: ITM-079
title: Resources of a product and of the instance
kind: implementation
level: 1
realises:
  - ONE SYSTEM IN TWO ROLES IS TWO ENTRIES
  - UC-040
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-047
  - ITM-008
origin: backlog refinement 2026-10-01
---
# ITM-079 Resources of a product and of the instance

**REGISTER**

## Outcome

UC-040: resources grouped by kind; *+ Add resource* per kind with what can be read filled in; licence, maintainer, secret by name, processing place; *Check*; *Save*; *Copy from the instance*; a newer upstream state shown with *Move*. The bridge route of *Check* arrives with the bridge.

## Realises

- `ONE SYSTEM IN TWO ROLES IS TWO ENTRIES`
- UC-040 — Declare the product's resources

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-dashboard-app (shell); the use cases it realises.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/resources-view.mjs` (new)
- `tests/dashboard-resources.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- guarded at review only: `ONE SYSTEM IN TWO ROLES IS TWO ENTRIES`

## Acceptance criteria

From the SPEC's checks:

- `ONE SYSTEM IN TWO ROLES IS TWO ENTRIES` — no automatic check; at review.

From the postcondition of UC-040 (Declare the product's resources), for the part this item builds:

> - `docs/resources.md` of the product repository names every resource the product is built with,
>   tested on or calls at runtime, each with kind, pin (where the kind has one), licence, maintainer,
>   route and processing place as its kind requires.
> - The instance's own resources, if any, are in `docs/resources.md` of the instance repository; the
>   two lists do not depend on each other.
> - No credential and no restricted content is in the product repository.
> - Jobs that need a resource run only where it is reachable, against the pinned state.
> - Rules a resource imposes are requirements only through a source (UC-015); systems that develop the
>   product are participants (UC-017).

Further:

- Every decision on the page takes one click once its inputs are complete (`ONE CLICK PER DECISION`, checked at review); every step carries a folded *What is this?* written for someone new to GitHub (`EVERY STEP EXPLAINS ITSELF`); every person-facing text lives in the dashboard (ARC-003 decision 5).
- Its tests run the real view in `tests/app-harness.mjs` against fakes the test file brings itself; a write happens only on a trusted click (counter-proof with a synthetic click).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-047 — resources
- ITM-008 — click authority

## Needs a person

No.
