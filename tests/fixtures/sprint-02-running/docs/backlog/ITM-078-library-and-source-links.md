---
id: ITM-078
title: The library and a product's sources — register, new version, link, move
kind: implementation
level: 1
realises:
  - UC-004
  - UC-015
  - UC-016
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-046
  - ITM-018
  - ITM-055
  - ITM-008
origin: backlog refinement 2026-10-01
---
# ITM-078 The library and a product's sources — register, new version, link, move

**REGISTER**

## Outcome

UC-004 (four routes, what becomes public, hashes in the browser, restricted content to a named repository), UC-015 (tick, version, part, one commit of `docs/sources.md`) and UC-016 (new version beside the old, products on older versions, *Move* with affected requirements marked).

## Realises

- UC-004 — Register a requirement source in the library
- UC-015 — Link requirement sources to a product
- UC-016 — A source gets a new version

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-dashboard-app (shell); the use cases it realises.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/library-view.mjs` (new)
- `docs/assets/dashboard/sources-view.mjs` (new)
- `tests/dashboard-library.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- none — it realises use cases only; its tests are the files listed above.

## Acceptance criteria


From the postcondition of UC-004 (Register a requirement source in the library), for the part this item builds:

> - The library lists the source with kind, authority, licence and at least one version, each version
>   with identifier, date and the SHA-256 of every file read.
> - No restricted content is in the public instance repository.
> - Products can now link to the source (UC-015).

From the postcondition of UC-015 (Link requirement sources to a product), for the part this item builds:

> - The product repository names every applicable source with a fixed version and, where given, the
>   applicable part.
> - Requirements can be derived from these sources (UC-005) and name them.
> - Nothing the product merely uses is listed here; that is `docs/resources.md` (UC-040).

From the postcondition of UC-016 (A source gets a new version), for the part this item builds:

> - The library holds both versions, unchanged.
> - Each product links to the version its author chose; a move is visible in the product's history
>   together with the requirements it affected.

Further:

- Every decision on the page takes one click once its inputs are complete (`ONE CLICK PER DECISION`, checked at review); every step carries a folded *What is this?* written for someone new to GitHub (`EVERY STEP EXPLAINS ITSELF`); every person-facing text lives in the dashboard (ARC-003 decision 5).
- Its tests run the real view in `tests/app-harness.mjs` against fakes the test file brings itself; a write happens only on a trusted click (counter-proof with a synthetic click).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-046 — register and links
- ITM-018 — requirements naming a source
- ITM-055 — Fetch again dispatches the workflow
- ITM-008 — click authority

## Needs a person

No.
