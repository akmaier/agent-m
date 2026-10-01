---
id: ITM-097
title: Mail → reply to the mails of an issue
kind: implementation
level: 1
realises:
  - UC-039
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-072
  - ITM-066
  - ITM-055
origin: backlog refinement 2026-10-01
---
# ITM-097 Mail → reply to the mails of an issue

**REGISTER**

## Outcome

UC-039: groups *to answer*, *answer received*, *open*; *Draft replies*; the complete mail in the send dialog; *Send*; *Ask the reporter*; *Close and reply*; *No reply*; *Reopen* only by a click.

## Realises

- UC-039 — Reply to the mails of an issue

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-dashboard-app (shell); the use cases it realises.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/mail-replies-view.mjs` (new)
- `tests/dashboard-mail-replies.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- none — it realises use cases only; its tests are the files listed above.

## Acceptance criteria


From the postcondition of UC-039 (Reply to the mails of an issue), for the part this item builds:

> - Every mail a closed issue lists has either a reply that the author released by a click on the exact
>   mail shown, or a recorded decision not to answer — both as comments on the issue, with identifier and
>   date only.
> - Each reply sits in the reporter's original thread and named no other reporter; a copy is in the
>   mailbox's *Sent* folder.
> - No mailbox flag, list of reporters or copy of a mail was written anywhere.
> - Clicks for a solved issue with one mail: *Draft replies*, *Send* (with its confirmation). For asking:
>   *Ask the reporter*, *Send and wait*.

Further:

- Every decision on the page takes one click once its inputs are complete (`ONE CLICK PER DECISION`, checked at review); every step carries a folded *What is this?* written for someone new to GitHub (`EVERY STEP EXPLAINS ITSELF`); every person-facing text lives in the dashboard (ARC-003 decision 5).
- Its tests run the real view in `tests/app-harness.mjs` against fakes the test file brings itself; a write happens only on a trusted click (counter-proof with a synthetic click).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-072 — replies
- ITM-066 — the Graph mailbox
- ITM-055 — issue comments, labels, close

## Needs a person

No.
