---
id: ITM-073
title: Get your own Agent M — the guided fork, Pages and workflow steps
kind: implementation
level: 1
realises:
  - AN INSTANCE IS A FORK OF AGENT M
  - THE PAGES ROOT IS DOCS
  - AGENT M IS MIT-LICENSED
  - EVERY STEP EXPLAINS ITSELF
  - UC-014
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-006
  - ITM-008
origin: backlog refinement 2026-10-01
---
# ITM-073 Get your own Agent M — the guided fork, Pages and workflow steps

**REGISTER**

## Outcome

UC-014 steps 1–5 on the original dashboard: the person's GitHub name, the fork page, `settings/pages` and `actions` of the fork opened directly, *Later* for the workflows, the address of the new dashboard; the licence shown with its explanation. The existing *Finish setting up* steps follow on the fork.

## Realises

- `AN INSTANCE IS A FORK OF AGENT M`
- `THE PAGES ROOT IS DOCS`
- `AGENT M IS MIT-LICENSED`
- `EVERY STEP EXPLAINS ITSELF`
- UC-014 — Get your own Agent M

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-dashboard-app (shell); the use cases it realises.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/get-your-own-view.mjs` (new)
- `tests/dashboard-get-your-own.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_instance_target.py` — `AN INSTANCE IS A FORK OF AGENT M`
- `tests/test_licence.py` — `AGENT M IS MIT-LICENSED`
- `tests/test_pages_layout.py` — `THE PAGES ROOT IS DOCS`
- `tests/test_step_explanations.py` — `EVERY STEP EXPLAINS ITSELF`

## Acceptance criteria

From the SPEC's checks:

- `AN INSTANCE IS A FORK OF AGENT M` — `tests/test_instance_target.py` — the dashboard derives its own repository from the Pages address it is served from.
- `THE PAGES ROOT IS DOCS` — `tests/test_pages_layout.py`
- `AGENT M IS MIT-LICENSED` — `tests/test_licence.py` — the root `LICENSE` is the MIT text.
- `EVERY STEP EXPLAINS ITSELF` — `tests/test_step_explanations.py`

From the postcondition of UC-014 (Get your own Agent M), for the part this item builds:

> - The person has a dashboard at their own address, served from `docs/` of their fork; no server was
>   set up.
> - One token, limited to the instance repository, is stored in this browser. Adding a product later
>   extends this token; it never needs a second one.
> - The fork also carries Agent M's own specification and use cases; the person does not have to
>   review them.

Further:

- Every decision on the page takes one click once its inputs are complete (`ONE CLICK PER DECISION`, checked at review); every step carries a folded *What is this?* written for someone new to GitHub (`EVERY STEP EXPLAINS ITSELF`); every person-facing text lives in the dashboard (ARC-003 decision 5).
- Its tests run the real view in `tests/app-harness.mjs` against fakes the test file brings itself; a write happens only on a trusted click (counter-proof with a synthetic click).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-006 — the key step names the full permission list
- ITM-008 — writes on a click authority

## Needs a person

No.
