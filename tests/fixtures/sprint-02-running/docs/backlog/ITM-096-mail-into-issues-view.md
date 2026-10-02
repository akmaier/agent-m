---
id: ITM-096
title: Mail → turn mails into issues
kind: implementation
level: 1
realises:
  - UC-038
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-071
  - ITM-066
  - ITM-067
  - ITM-055
origin: backlog refinement 2026-10-01
---
# ITM-096 Mail → turn mails into issues

**REGISTER**

## Outcome

UC-038: *Read mailbox*, mails listed in this browser only, participant and checkers with their places, *Propose*, the mail beside the proposal, *Create issue* only when the checks pass, *Add to #n*, *Not an issue*.

## Realises

- UC-038 — Turn mails into issues

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-dashboard-app (shell); the use cases it realises.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/mail-view.mjs` (new)
- `tests/dashboard-mail.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- none — it realises use cases only; its tests are the files listed above.

## Acceptance criteria


From the postcondition of UC-038 (Turn mails into issues), for the part this item builds:

> - Every created issue carries neutral technical text, a product, the label `defect` or `change`, and the
>   `MAIL-` identifiers of its mails; no name, address or signature from a mail reached any repository or
>   issue tracker.
> - The mails are unchanged in the mailbox; nothing about them is stored anywhere else.
> - Clicks per reading: *Read mailbox*, *Propose*, then one decision per mail.

Further:

- Every decision on the page takes one click once its inputs are complete (`ONE CLICK PER DECISION`, checked at review); every step carries a folded *What is this?* written for someone new to GitHub (`EVERY STEP EXPLAINS ITSELF`); every person-facing text lives in the dashboard (ARC-003 decision 5).
- Its tests run the real view in `tests/app-harness.mjs` against fakes the test file brings itself; a write happens only on a trusted click (counter-proof with a synthetic click).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-071 — proposals
- ITM-066 — the Graph mailbox
- ITM-067 — the connection
- ITM-055 — issues

## Needs a person

No.
