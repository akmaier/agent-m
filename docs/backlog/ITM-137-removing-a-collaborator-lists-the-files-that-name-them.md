---
id: ITM-137
title: Removing a collaborator lists the files on the default branch that still name them
kind: implementation
level: 1
realises:
  - A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT
  - UC-042
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-136
origin: sprint 01 review
---
# ITM-137 Removing a collaborator lists the files on the default branch that still name them

**REGISTER**

## Outcome

UC-042 5a: **Remove** takes a collaborator off `docs/collaborators.md` with one commit — as today — and then lists the
files on the product's default branch that still name the person, for the person removing them to change; the page still
says that earlier commits keep the name. Today the removal is committed and the page says earlier commits keep the name;
no file is listed (`dashboard/settings-view.mjs` `loadProductSettings`;
`docs/measurements/2026-10-01_built-flows-characterised.md`, section 3). The dashboard reads the default branch's text files and finds the person's name and account in them with
MOD-pseudonymiser's `findPeople(text, people)`, which MOD-pseudonymiser already provides; no interface changes.

## Realises

- `A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT`
- UC-042 — Manage settings in one place (5a)

## Where it came from

Sprint 01 review (`docs/backlog/sprints/sprint-01.md`, *Review*, feedback 13): a flow ITM-123 found not carried out (its
test T59 covers the part that holds). No existing item builds it.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/settings-view.mjs` (reads the files, calls `findPeople`, shows the list after *Remove*)
- `tests/dashboard-collaborator-removed.test.mjs` (new — run in `tests/app-harness.mjs`)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_collaborators.py` — `A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT`

## Acceptance criteria

From the postcondition of UC-042 (Manage settings in one place), for the part this item builds:

> - Browser settings changed or cleared here are changed or cleared in `localStorage` itself; repository
>   settings changed here are commits under the person's account.

Further:

- After *Remove* of a collaborator whose name stands in two files of the default branch, those two files are listed and nothing else is written; counter-proof: a collaborator named nowhere else gets an empty list, and the dashboard of today lists none.
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-136 — changes `docs/assets/dashboard/settings-view.mjs` first

## Needs a person

No.
