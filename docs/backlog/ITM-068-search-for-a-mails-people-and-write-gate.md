---
id: ITM-068
title: A text from a mail searched for that mail's people, the write gate, and who consented to be named
kind: implementation
level: 1
realises:
  - THE PRODUCT ISSUE CARRIES NO PERSONAL DATA
  - NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY
  - A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE
  - PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF
  - A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT
modules:
  - MOD-pseudonymiser
depends_on:
  - ITM-004
origin: backlog refinement 2026-10-01
---
# ITM-068 A text from a mail searched for that mail's people, the write gate, and who consented to be named

**REGISTER**

## Outcome

`peopleOf(mail)`, `findPeople(text, people)` (normalised for case and typographic dashes; a hit returned to the caller only, never recorded), `writeGate(…)` without the three checkers' verdicts for a hand-written text, and `namedPersons(text, collaborators, accounts)` of MOD-pseudonymiser.

## Realises

- `THE PRODUCT ISSUE CARRIES NO PERSONAL DATA`
- `NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY`
- `A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE`
- `PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF`
- `A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-pseudonymiser; ARC-014 (the write gate).

Architecture decisions its modules follow: ARC-003, ARC-007, ARC-014.

## Modules

- MOD-pseudonymiser (features) — uses MOD-job-harness

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/pseudonymiser/people.mjs` (new)
- `tests/test_mail_privacy.py` (created here)
- `tests/test_collaborators.py`
- `tests/fixtures/mails/`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_collaborators.py` — `A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT`
- `tests/test_mail_privacy.py` — `THE PRODUCT ISSUE CARRIES NO PERSONAL DATA`; `NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY`; `A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE`; `PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF`

## Acceptance criteria

From the SPEC's checks:

- `THE PRODUCT ISSUE CARRIES NO PERSONAL DATA` — `tests/test_mail_privacy.py` — deterministic: every address and display name from the mail's headers, and every address and phone number found in its body, is absent from the issue text. How often the participant's neutral text still contains personal data is measured as a rate on a fixed set of mails (§4.0a rule 4), reported, not gated.
- `NO PERSONAL DATA FROM A MAIL ENTERS A REPOSITORY` — `tests/test_mail_privacy.py` — after a full run on test mails — issue, backlog item, SPEC proposal, regression test, job record, reply note —, no write contains any name, address, phone number or account from those mails; counter-proof: a planted address in a job record is found.
- `A TEXT FROM A MAIL IS SEARCHED FOR THAT MAIL'S PEOPLE` — `tests/test_mail_privacy.py` — an issue text containing the sender's name, or a name from the mail's signature, is refused and the hit named; counter-proof: the same text without the name passes.
- `PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF` — `tests/test_mail_privacy.py` — a product without the setting gets rewritten report data; counter-proof: a product that switched it off gets the original data.
- `A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT` — `tests/test_collaborators.py` — a name in a generated artifact that is neither an account nor in `docs/collaborators.md` is reported; counter-proof: a listed collaborator's name passes.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-004 — test-file conventions

## Needs a person

No.

## From the sprint 01 review

ITM-007 quoted, among its acceptance criteria, the checks of `tests/test_mail_privacy.py` for `PSEUDONYMISATION IS ON
UNLESS A PRODUCT SWITCHES IT OFF` — a product without the setting gets rewritten report data; counter-proof: a product
that switched it off gets the original data — and for `REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS`,
but built neither: they exercise MOD-pseudonymiser's write gate, which was not among ITM-007's modules, and the file was
not in its list (pull request #34, *Left out of this item*). This item creates `tests/test_mail_privacy.py` and the write
gate, so the first of the two checks is written here, against the setting as ITM-007 explained it; the second stays with
ITM-069, which names it. (Sprint 01 review, `docs/backlog/sprints/sprint-01.md`, feedback 11.)
