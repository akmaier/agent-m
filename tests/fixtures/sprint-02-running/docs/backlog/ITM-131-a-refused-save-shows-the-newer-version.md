---
id: ITM-131
title: A refused save shows the newer version beside the edit
kind: implementation
level: 1
realises:
  - A REFUSED SAVE KEEPS THE EDIT
  - UC-008
modules:
  - MOD-dashboard-app
depends_on: []
origin: sprint 01 review
---
# ITM-131 A refused save shows the newer version beside the edit

**REGISTER**

## Outcome

When *Save* in the dashboard's editor is refused because the file changed since the editor opened, the edit stays in the
editor and the newer version from the default branch is shown beside it, as `A REFUSED SAVE KEEPS THE EDIT` says. Today
the edit stays, but the page shows only the refusal: `dashboard/review-views.mjs` `wireCommon`, the `[data-edit-save]`
handler, catches the error of `saveReviewedFile` → `git-host.mjs` `commitFiles` ("… changed since you opened it — reload
and look at the new text first") and only sets `out.textContent = app.writeErrorText(e)`. This holds for every editor
the review views open — a use case, an architecture decision, a module, a SPEC change proposal.

## Realises

- `A REFUSED SAVE KEEPS THE EDIT`
- UC-008 — Review and accept a use case (3a: edit and *Save*)

## Where it came from

Sprint 01 review (`docs/backlog/sprints/sprint-01.md`, *Review*, feedback 12): ITM-123 found it while characterising
UC-008 3a — `docs/measurements/2026-10-01_built-flows-characterised.md`, section 4. Its test T09 asserts only the part that
holds and does not pin the gap.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/review-views.mjs` (the refused save reads the newer version and shows it beside the edit)
- `tests/review-core.d/refused-save.test.mjs` (new — the check SPEC.md names at `tests/review-core.test.mjs`, run in `tests/app-harness.mjs`)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `A REFUSED SAVE KEEPS THE EDIT` (added as a file of `tests/review-core.d/`)

## Acceptance criteria

- `A REFUSED SAVE KEEPS THE EDIT` — in `tests/app-harness.mjs`: after the file is changed on the server and *Save* is clicked, nothing is written, the textarea still holds the edit, and the newer text is shown beside it; counter-proof: the dashboard of today shows no newer text.
- The same for a SPEC change proposal edited on the SPEC changes page (UC-006 3a).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- nothing

## Needs a person

No.
