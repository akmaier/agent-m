---
id: ITM-072
title: Replies to the mails of an issue — offers, drafts in the mailbox, notes in the issue
kind: implementation
level: 1
realises:
  - CLOSING AN ISSUE PREPARES ITS REPLIES
  - THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS
  - A REPLY SENT FROM THE MAIL PROGRAM IS NOTED TOO
  - A SENT REPLY IS NOTED IN THE ISSUE
  - AN ISSUE WAITING FOR A REPORTER IS LABELLED
  - A REPORTER'S ANSWER IS SHOWN AT ITS ISSUE
  - A CLOSED ISSUE IS REOPENED ONLY BY A PERSON
  - A REPLY GOES TO ONE REPORTER
  - THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING
  - AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS
  - UC-039
modules:
  - MOD-mail-flow
depends_on:
  - ITM-070
  - ITM-066
origin: backlog refinement 2026-10-01
---
# ITM-072 Replies to the mails of an issue — offers, drafts in the mailbox, notes in the issue

**REGISTER**

## Outcome

`replyOffers`, `replyDraft` and `replyNote` of MOD-mail-flow: offers derived from issues, *Drafts* and *Sent* alone; one reporter per reply, threaded on that reporter's mail; notes with identifier and date only.

## Realises

- `CLOSING AN ISSUE PREPARES ITS REPLIES`
- `THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS`
- `A REPLY SENT FROM THE MAIL PROGRAM IS NOTED TOO`
- `A SENT REPLY IS NOTED IN THE ISSUE`
- `AN ISSUE WAITING FOR A REPORTER IS LABELLED`
- `A REPORTER'S ANSWER IS SHOWN AT ITS ISSUE`
- `A CLOSED ISSUE IS REOPENED ONLY BY A PERSON`
- `A REPLY GOES TO ONE REPORTER`
- `THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING`
- `AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS`
- UC-039 — Reply to the mails of an issue

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-mail-flow.

Architecture decisions its modules follow: ARC-003, ARC-007, ARC-014.

## Modules

- MOD-mail-flow (features) — uses MOD-job-harness, MOD-pseudonymiser

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/mail-flow/replies.mjs` (new)
- `docs/assets/jobs/draft-replies/` (new)
- `tests/test_mail_replies.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_mail_replies.py` — `CLOSING AN ISSUE PREPARES ITS REPLIES`; `THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS`; `A REPLY SENT FROM THE MAIL PROGRAM IS NOTED TOO`; `A SENT REPLY IS NOTED IN THE ISSUE`; `AN ISSUE WAITING FOR A REPORTER IS LABELLED`; `A REPORTER'S ANSWER IS SHOWN AT ITS ISSUE`; `A CLOSED ISSUE IS REOPENED ONLY BY A PERSON`; `A REPLY GOES TO ONE REPORTER`; `THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING`; `AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS`

## Acceptance criteria

From the SPEC's checks:

- `CLOSING AN ISSUE PREPARES ITS REPLIES` — `tests/test_mail_replies.py` — a closed issue listing two mails yields two offers; counter-proof: with a reply noted for one, one offer.
- `THE SEND DASHBOARD LISTS THE DRAFTS OF LISTED MAILS` — `tests/test_mail_replies.py` — a draft replying to a listed mail is shown; counter-proof: an unrelated draft of the person is not.
- `A REPLY SENT FROM THE MAIL PROGRAM IS NOTED TOO` — `tests/test_mail_replies.py` — a reply placed in *Sent* by hand is noted at the next reading; counter-proof: an unrelated sent mail is not.
- `A SENT REPLY IS NOTED IN THE ISSUE` — `tests/test_mail_replies.py` — after sending, the issue has one comment with the identifier and date and no address; counter-proof: no draft is offered for that mail again.
- `AN ISSUE WAITING FOR A REPORTER IS LABELLED` — `tests/test_mail_replies.py`
- `A REPORTER'S ANSWER IS SHOWN AT ITS ISSUE` — `tests/test_mail_replies.py`
- `A CLOSED ISSUE IS REOPENED ONLY BY A PERSON` — `tests/test_mail_replies.py`
- `A REPLY GOES TO ONE REPORTER` — `tests/test_mail_replies.py` — an issue with three reports yields three mails, each with one reporter.
- `THE ISSUE IS THE ONLY RECORD OF A MAIL'S HANDLING` — `tests/test_mail_replies.py` — the mail dashboard's groups are computed from issues and the mailbox alone; counter-proof: clearing the browser's storage changes none of them.
- `AN ISSUE FROM A MAIL NAMES ITS MAILS BY THEIR IDENTIFIERS` — `tests/test_mail_replies.py` — closing an issue with two listed identifiers offers two replies, found through the identifiers alone.

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

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-070 — identifiers
- ITM-066 — the mailbox interface the drafts are stored through

## Needs a person

No.
