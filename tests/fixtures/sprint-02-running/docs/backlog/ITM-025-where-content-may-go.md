---
id: ITM-025
title: One rule for where content may go — mayReceive over the owners' labels
kind: implementation
level: 1
realises:
  - RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
  - A PARTICIPANT THAT WRITES TO A REPOSITORY NEVER RECEIVES A MAIL
modules:
  - MOD-job-harness
depends_on:
  - ITM-023
  - ITM-068
origin: backlog refinement 2026-10-01
---
# ITM-025 One rule for where content may go — mayReceive over the owners' labels

**REGISTER**

## Outcome

`mayReceive(labels, place, { writes })` decides over the labels a source, a mailbox or a mail carries whether content may go to a participant processing data at `place`, and to a job that writes to a repository; an unknown place is refused, and the refusing label is named (ARC-007 decision 6).

## Realises

- `RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS`
- `A PARTICIPANT THAT WRITES TO A REPOSITORY NEVER RECEIVES A MAIL`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-job-harness `mayReceive`; ARC-007 decision 6.

Architecture decisions its modules follow: ARC-003, ARC-007, ARC-009.

## Modules

- MOD-job-harness (kernel) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/job-harness/may-receive.mjs` (new)
- `tests/review-core.d/may-receive.test.mjs`
- `tests/test_mail_privacy.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS`
- `tests/test_mail_privacy.py` — `A PARTICIPANT THAT WRITES TO A REPOSITORY NEVER RECEIVES A MAIL`

## Acceptance criteria

From the SPEC's checks:

- `RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS` — `tests/review-core.test.mjs`
- `A PARTICIPANT THAT WRITES TO A REPOSITORY NEVER RECEIVES A MAIL` — `tests/test_mail_privacy.py` — the inputs of an implementation job started from a mail's issue contain no text of the mail.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-023 — definitions
- ITM-068 — extends tests/test_mail_privacy.py, which ITM-068 creates

## Needs a person

No.
