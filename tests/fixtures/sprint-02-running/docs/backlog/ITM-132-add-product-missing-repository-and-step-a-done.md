---
id: ITM-132
title: Add product — a repository that does not exist is named with GitHub's page for a new one, and Step A shows as done when the token already reaches the product
kind: implementation
level: 1
realises:
  - EVERY STEP EXPLAINS ITSELF
  - ONE CLICK PER DECISION
  - UC-001
modules:
  - MOD-dashboard-app
depends_on: []
origin: sprint 01 review
---
# ITM-132 Add product — a repository that does not exist is named with GitHub's page for a new one, and Step A shows as done when the token already reaches the product

**REGISTER**

## Outcome

Two alternative flows of UC-001 that the dashboard does not carry out today
(`docs/measurements/2026-10-01_built-flows-characterised.md`, section 3):

- **2a.** When the product's repository does not exist, *Check* says so and links GitHub's page for a new repository.
  Today *Check* shows `✗ <owner>/<name>: 404 …` and *Add product* "Your key cannot write to … (… 404 …)", without a link
  (`dashboard/add-product-view.mjs` `viewAddProduct`, `wireAddGo`).
- **3a.** When the stored token already reaches the product, Step A is shown as done. Today Step A's instructions are
  shown always, also after a successful *Check* (`viewAddProduct`).

## Realises

- `EVERY STEP EXPLAINS ITSELF`
- `ONE CLICK PER DECISION`
- UC-001 — Add a managed product (2a, 3a)

## Where it came from

Sprint 01 review (`docs/backlog/sprints/sprint-01.md`, *Review*, feedback 13): flows ITM-123 found not carried out. No
existing item builds them.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/add-product-view.mjs`
- `tests/dashboard-add-product.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_step_explanations.py` — `EVERY STEP EXPLAINS ITSELF`

## Acceptance criteria

From the postcondition of UC-001 (Add a managed product), for the part this item builds:

> - Clicks: *+ Add product*, *Open your tokens on GitHub*, on GitHub *Edit* and *Update*, *Check*,
>   *Add product*. If the token already reaches the product: *+ Add product*, *Check*, *Add product*.

Further:

- 2a: with a product address the server answers `404` for, *Check* names the missing repository and links GitHub's page for a new repository; nothing is written. Counter-proof: an existing repository gets no such link.
- 3a: with a token that already reaches the product, Step A is shown as done after *Check*; counter-proof: a token that does not reach it keeps Step A's instructions.
- Every decision on the page takes one click once its inputs are complete; every step carries a folded *What is this?*; its tests run the real view in `tests/app-harness.mjs`.
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- nothing

## Needs a person

No.
