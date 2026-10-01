---
id: ITM-098
title: Settings — the instance's and the product's repository settings in one place
kind: implementation
level: 1
realises:
  - EVERY SETTING IS REACHED FROM ONE PAGE
  - A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY
  - UC-042
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-080
  - ITM-078
  - ITM-081
  - ITM-079
  - ITM-082
  - ITM-092
origin: backlog refinement 2026-10-01
---
# ITM-098 Settings — the instance's and the product's repository settings in one place

**REGISTER**

## Outcome

UC-042 step 3: each repository setting of the instance (participants, source library, process models, instance resources) and of the product (model and roles, Definition of Done, test schedule, linked sources, resources, pseudonymisation, collaborators) as a summary with *Edit*, opening its form in place.

## Realises

- `EVERY SETTING IS REACHED FROM ONE PAGE`
- `A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY`
- UC-042 — Manage settings in one place

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-dashboard-app (shell); the use cases it realises.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/settings/instance.mjs` (new)
- `docs/assets/dashboard/settings/product.mjs` (new)
- `tests/dashboard-settings-repository.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_settings_page.py` — `EVERY SETTING IS REACHED FROM ONE PAGE`; `A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY`

## Acceptance criteria

From the SPEC's checks:

- `EVERY SETTING IS REACHED FROM ONE PAGE` — `tests/test_settings_page.py` — every key the dashboard writes to `localStorage` appears on the page; counter-proof: a fixture key without a place on the page fails.
- `A PRODUCT'S SETTINGS LIVE IN ITS REPOSITORY` — `tests/test_settings_page.py` — changing a product setting on the page commits to the product repository; counter-proof: `localStorage` holds no product setting.

From the postcondition of UC-042 (Manage settings in one place), for the part this item builds:

> - The person has seen every setting Agent M uses, where it is kept, and whether it works.
> - Browser settings changed or cleared here are changed or cleared in `localStorage` itself; repository
>   settings changed here are commits under the person's account.
> - No secret was shown in full except on **Show**, written to a repository, or put into a URL; an export
>   holds them only after the notice.

Further:

- Every decision on the page takes one click once its inputs are complete (`ONE CLICK PER DECISION`, checked at review); every step carries a folded *What is this?* written for someone new to GitHub (`EVERY STEP EXPLAINS ITSELF`); every person-facing text lives in the dashboard (ARC-003 decision 5).
- Its tests run the real view in `tests/app-harness.mjs` against fakes the test file brings itself; a write happens only on a trusted click (counter-proof with a synthetic click).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-080 — participants
- ITM-078 — library and sources
- ITM-081 — process models
- ITM-079 — resources
- ITM-082 — declaration and Definition of Done
- ITM-092 — test schedule

## Needs a person

No.
