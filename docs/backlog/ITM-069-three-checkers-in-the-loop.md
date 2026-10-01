---
id: ITM-069
title: Three LLM checkers of three models as one check of the correction loop — never the rewriter
kind: implementation
level: 1
realises:
  - REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS
  - A REWRITTEN TEXT IS CHECKED BY THREE LLMS
  - NO CHECKER IS THE REWRITER
modules:
  - MOD-pseudonymiser
depends_on:
  - ITM-068
  - ITM-024
  - ITM-029
  - ITM-025
origin: backlog refinement 2026-10-01
---
# ITM-069 Three LLM checkers of three models as one check of the correction loop — never the rewriter

**REGISTER**

## Outcome

`personChecks({ people, checkers })`, `checkers(participants, allowedPlaces, rewriter)` and the full `writeGate`: verdicts of three checkers with three different models at allowed places naming the SHA-256 of exactly the text; the rewriter and its model excluded; fewer than three is `missing` with the reasons.

## Realises

- `REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS`
- `A REWRITTEN TEXT IS CHECKED BY THREE LLMS`
- `NO CHECKER IS THE REWRITER`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-pseudonymiser; ARC-014 (the checkers are held like the rewriter).

Architecture decisions its modules follow: ARC-003, ARC-007, ARC-014.

## Modules

- MOD-pseudonymiser (features) — uses MOD-job-harness

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/pseudonymiser/checks.mjs` (new)
- `docs/assets/jobs/check-for-persons/` (new)
- `tests/test_mail_privacy.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_mail_privacy.py` — `REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS`; `A REWRITTEN TEXT IS CHECKED BY THREE LLMS`; `NO CHECKER IS THE REWRITER`

## Acceptance criteria

From the SPEC's checks:

- `REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS` — `tests/test_mail_privacy.py` — a fixture log with a name, a mail address, a phone number, an IP address and a home-directory path, rewritten by a fixture participant, contains none of them; counter-proof: a rewriting that keeps one is refused. How often a rewriting keeps the error message, stack trace and version is measured as a rate on a fixed set of reports, reported, not gated.
- `A REWRITTEN TEXT IS CHECKED BY THREE LLMS` — `tests/test_mail_privacy.py` — with three fixture checkers of which one reports a name, nothing is written and the finding goes back; counter-proof: when none reports one, the text is written. How often a person passes all three is measured as a rate on a fixed set of mails, reported, not gated.
- `NO CHECKER IS THE REWRITER` — `tests/test_mail_privacy.py` — a set of checkers that includes the rewriter, or a checker with the rewriter's model, is refused before anything is sent; counter-proof: three checkers with three other models are accepted.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-068 — people search and gate
- ITM-024 — the loop
- ITM-029 — participants name their models
- ITM-025 — extends tests/test_mail_privacy.py after it

## Needs a person

No.
