---
id: ITM-070
title: Mail identifiers, mails already decided, known threads, and an issue from a person's decision
kind: implementation
level: 1
realises:
  - A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER
  - A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN
  - A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK
  - AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE
  - A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL
  - A DUPLICATE MAIL IS ADDED TO THE EXISTING ISSUE
modules:
  - MOD-mail-flow
depends_on:
  - ITM-068
origin: backlog refinement 2026-10-01
---
# ITM-070 Mail identifiers, mails already decided, known threads, and an issue from a person's decision

**REGISTER**

## Outcome

`mailId`, `pendingMails` and `issueFromDecision` of MOD-mail-flow, over a fake mailbox and a fake issue tracker passed in as ports.

## Realises

- `A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER`
- `A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN`
- `A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK`
- `AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE`
- `A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL`
- `A DUPLICATE MAIL IS ADDED TO THE EXISTING ISSUE`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-mail-flow.

Architecture decisions its modules follow: ARC-003, ARC-007, ARC-014.

## Modules

- MOD-mail-flow (features) — uses MOD-job-harness, MOD-pseudonymiser

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/mail-flow.mjs` (new)
- `tests/test_mail_import.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_mail_import.py` — `A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER`; `A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN`; `A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK`; `AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE`; `A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL`; `A DUPLICATE MAIL IS ADDED TO THE EXISTING ISSUE`

## Acceptance criteria

From the SPEC's checks:

- `A MAIL IS NAMED BY A PSEUDONYMOUS IDENTIFIER` — `tests/test_mail_import.py` — the identifier is stable across two readings of the same mail; counter-proof: two mails with different `Message-ID`s get different identifiers.
- `A MAIL ALREADY DECIDED IS NOT PROPOSED AGAIN` — `tests/test_mail_import.py` — a second reading proposes no listed and no marked mail; counter-proof: an unmarked new mail is proposed.
- `A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK` — `tests/test_mail_import.py` — a run without the click creates no issue; the participant's job definition contains no issue-creating call.
- `AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE` — `tests/test_mail_import.py`
- `A MAIL IN A KNOWN THREAD IS MATCHED WITHOUT A MODEL` — `tests/test_mail_import.py`
- `A DUPLICATE MAIL IS ADDED TO THE EXISTING ISSUE` — `tests/test_mail_import.py`

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-068 — the write gate

## Needs a person

No.
