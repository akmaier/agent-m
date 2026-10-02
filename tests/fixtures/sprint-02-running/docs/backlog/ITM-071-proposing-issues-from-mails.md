---
id: ITM-071
title: Proposing issues from mails as one drafting job — product, kind, neutral text, report data rewritten
kind: implementation
level: 1
realises:
  - MAIL STAYS IN THE MAILBOX
  - THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED
  - UC-038
modules:
  - MOD-mail-flow
depends_on:
  - ITM-070
  - ITM-069
origin: backlog refinement 2026-10-01
---
# ITM-071 Proposing issues from mails as one drafting job — product, kind, neutral text, report data rewritten

**REGISTER**

## Outcome

`proposeIssues(…)`: per mail one drafting job through `runDraft` with the rewriter's driver and the checks of `personChecks`, refused for a rewriter or checker at a place the mailbox does not allow; after a full run no write contains a sender, a body or an attachment (a planted body as counter-proof).

## Realises

- `MAIL STAYS IN THE MAILBOX`
- `THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED`
- UC-038 — Turn mails into issues

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-mail-flow `proposeIssues`; ARC-014.

Architecture decisions its modules follow: ARC-003, ARC-007, ARC-014.

## Modules

- MOD-mail-flow (features) — uses MOD-job-harness, MOD-pseudonymiser

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/mail-flow/propose.mjs` (new)
- `docs/assets/jobs/propose-issue-from-mail/` (new)
- `tests/test_mail_privacy.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_mail_privacy.py` — `MAIL STAYS IN THE MAILBOX`; `THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED`

## Acceptance criteria

From the SPEC's checks:

- `MAIL STAYS IN THE MAILBOX` — `tests/test_mail_privacy.py` — after a full run on test mails, no write of Agent M contains a sender address, a sender name, the body of a mail as a whole or one of its attachments; counter-proof: a planted body in a job record is found.
- `THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED` — `tests/test_mail_privacy.py` — a mail is not sent to a participant whose processing place is not listed; counter-proof: it is sent to one whose place is.

From the postcondition of UC-038 (Turn mails into issues), for the part this item builds:

> - Every created issue carries neutral technical text, a product, the label `defect` or `change`, and the
>   `MAIL-` identifiers of its mails; no name, address or signature from a mail reached any repository or
>   issue tracker.
> - The mails are unchanged in the mailbox; nothing about them is stored anywhere else.
> - Clicks per reading: *Read mailbox*, *Propose*, then one decision per mail.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-070 — identifiers and pending mails
- ITM-069 — the three checks; extends tests/test_mail_privacy.py after it

## Needs a person

No.
