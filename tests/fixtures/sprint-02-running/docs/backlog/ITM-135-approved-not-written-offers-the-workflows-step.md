---
id: ITM-135
title: An approval the workflows have not written says why and offers the workflows step
kind: implementation
level: 1
realises:
  - WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE
  - EVERY STEP EXPLAINS ITSELF
  - UC-014
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-073
  - ITM-134
origin: sprint 01 review
---
# ITM-135 An approval the workflows have not written says why and offers the workflows step

**REGISTER**

## Outcome

UC-014 4a and the late offer of step 3: an approval of the instance's own SPEC committed on GitHub's page without a token,
in a fork whose Actions are not enabled, is shown on the SPEC changes page as *approved*, not *in SPEC*, with the reason —
the instance's workflow writes it, and the workflows are off — and with step 3 of UC-014 (*Turn on the workflows*,
opening the fork's `actions` page) offered right there. Today the status *approved* is explained only in its badge's
title, and step 3 is offered nowhere after the setup (`docs/measurements/2026-10-01_built-flows-characterised.md`,
section 3). Step 3 itself is the page ITM-073 builds; this item offers it again where a feature first needs it.

## Realises

- `WITHOUT A TOKEN, THE INSTANCE'S WORKFLOW WRITES THE CHANGE`
- `EVERY STEP EXPLAINS ITSELF`
- UC-014 — Get your own Agent M (step 3 offered later, 4a)

## Where it came from

Sprint 01 review (`docs/backlog/sprints/sprint-01.md`, *Review*, feedback 13): flows ITM-123 found not carried out.
ITM-073 builds UC-014 steps 1–5 with *Later* for the workflows; no item offers the step again.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/spec-changes-view.mjs` (the status *approved* with its reason and the offer of step 3)
- `tests/dashboard-workflows-step.test.mjs` (new — run in `tests/app-harness.mjs`)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_step_explanations.py` — `EVERY STEP EXPLAINS ITSELF`

## Acceptance criteria

From the postcondition of UC-014 (Get your own Agent M), for the part this item builds:

> - The person has a dashboard at their own address, served from `docs/` of their fork; no server was
>   set up.

Further:

- An approval record of the instance's own SPEC whose section is not in `SPEC.md` is shown *approved*, with the reason and a link to the fork's `actions` page; counter-proof: an approval whose text is in `SPEC.md` is shown *in SPEC*, without the offer.
- Every step carries a folded *What is this?*; every person-facing text lives in the dashboard (ARC-003 decision 5).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-073 — the workflows step of UC-014
- ITM-134 — changes `docs/assets/dashboard/spec-changes-view.mjs` first

## Needs a person

No.

## Notes

UC-014 4a also says that EU legal texts are registered but not fetched until step 3 is done; that part belongs to the item
that builds the fetch (ITM-049) and the library view (ITM-078), not to this one.
