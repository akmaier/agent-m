---
id: ITM-116
title: Nightly model-dependent measurements of Agent M — classification, loop rounds, personal data, rewriting
kind: implementation
level: 1
realises:
  - A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
  - THE MODEL'S CLASSIFICATION IS MEASURED, NOT TRUSTED
  - THE PRODUCT ISSUE CARRIES NO PERSONAL DATA
  - REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS
  - A REWRITTEN TEXT IS CHECKED BY THREE LLMS
modules:
  - MOD-derivation
  - MOD-job-harness
  - MOD-pseudonymiser
  - MOD-mail-flow
depends_on:
  - ITM-045
  - ITM-069
  - ITM-071
  - ITM-062
origin: backlog refinement 2026-10-01
---
# ITM-116 Nightly model-dependent measurements of Agent M — classification, loop rounds, personal data, rewriting

**REGISTER**

## Outcome

ARC-016 kind 4 wired into Agent M's schedule (nightly and on release candidates): each measurement on a fixed set with several phrasings and a run count fixed before the first run, reported as a rate with its interval against the last release, never gated.

## Realises

- `A MODEL-DEPENDENT TEST IS MEASURED AS A RATE`
- `THE MODEL'S CLASSIFICATION IS MEASURED, NOT TRUSTED`
- `THE PRODUCT ISSUE CARRIES NO PERSONAL DATA`
- `REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS`
- `A REWRITTEN TEXT IS CHECKED BY THREE LLMS`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — ARC-016 kind 4; the modules' Testing sections.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-007, ARC-009, ARC-014.

## Modules

- MOD-derivation (features) — uses MOD-artifacts, MOD-job-harness, MOD-review-core, MOD-source-library, MOD-traceability
- MOD-job-harness (kernel) — uses no other module
- MOD-pseudonymiser (features) — uses MOD-job-harness
- MOD-mail-flow (features) — uses MOD-job-harness, MOD-pseudonymiser

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `tests/rates/` (new folders per measurement)
- `docs/tests/schedule.md`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_derivation_classes.py` — `THE MODEL'S CLASSIFICATION IS MEASURED, NOT TRUSTED`
- `tests/test_mail_privacy.py` — `THE PRODUCT ISSUE CARRIES NO PERSONAL DATA`; `REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS`; `A REWRITTEN TEXT IS CHECKED BY THREE LLMS`
- `tests/test_rate_reporting.py` — `A MODEL-DEPENDENT TEST IS MEASURED AS A RATE`

## Acceptance criteria

From the SPEC's checks:

- `A MODEL-DEPENDENT TEST IS MEASURED AS A RATE` — `tests/test_rate_reporting.py`
- `THE MODEL'S CLASSIFICATION IS MEASURED, NOT TRUSTED` — `tests/test_derivation_classes.py` — the rate is reported, not gated.
- `THE PRODUCT ISSUE CARRIES NO PERSONAL DATA` — `tests/test_mail_privacy.py` — deterministic: every address and display name from the mail's headers, and every address and phone number found in its body, is absent from the issue text. How often the participant's neutral text still contains personal data is measured as a rate on a fixed set of mails (§4.0a rule 4), reported, not gated.
- `REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS` — `tests/test_mail_privacy.py` — a fixture log with a name, a mail address, a phone number, an IP address and a home-directory path, rewritten by a fixture participant, contains none of them; counter-proof: a rewriting that keeps one is refused. How often a rewriting keeps the error message, stack trace and version is measured as a rate on a fixed set of reports, reported, not gated.
- `A REWRITTEN TEXT IS CHECKED BY THREE LLMS` — `tests/test_mail_privacy.py` — with three fixture checkers of which one reports a name, nothing is written and the finding goes back; counter-proof: when none reports one, the text is written. How often a person passes all three is measured as a rate on a fixed set of mails, reported, not gated.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-045 — the classification rate
- ITM-069 — the checkers
- ITM-071 — the proposals
- ITM-062 — Agent M's own schedule

## Needs a person

The PO stores a model endpoint key as an Actions secret of `akmaier/agent-m` and chooses the endpoints measured.
