---
id: ITM-007
title: The pseudonymisation setting is explained as rewriting without persons, not as stand-ins
kind: implementation
level: 1
realises:
  - PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF
  - REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS
  - SWITCHING PSEUDONYMISATION OFF STATES WHAT FOLLOWS
  - UC-042
modules:
  - MOD-dashboard-app
depends_on:
  - ITM-006
origin: backlog refinement 2026-10-01
---
# ITM-007 The pseudonymisation setting is explained as rewriting without persons, not as stand-ins

**REGISTER**

## Outcome

The folded explanation of the product setting *Pseudonymisation* (today `review-app.mjs` lines 1540–1542, "… replaced by stand-ins") says what the accepted SPEC says since 2026-09-30: with the setting on, report data from mails reaches the product's issues and repository only as a participant's rewriting that mentions no person, checked by three LLMs; surrogates were withdrawn (`REPORT DATA IS PSEUDONYMISED BEFORE IT LEAVES THE MAILBOX`, `A SURROGATE IS THE SAME WITHIN A REPORT`, `THE SURROGATE MAPPING IS NEVER STORED` are withdrawn names).

## Realises

- `PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF`
- `REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS`
- `SWITCHING PSEUDONYMISATION OFF STATES WHAT FOLLOWS`
- UC-042 — Manage settings in one place

## Where it came from

Known stale text after queue 2026-09-30k_umschreiben-statt-surrogate (accepted): `docs/assets/review-app.mjs` lines 1540–1542 at commit 26a3010 (the request named ~1269–1271; the text stands at 1540–1542).

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-005.

## Modules

- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/dashboard/settings-view.mjs` (the product section)
- `tests/test_settings_disclosure.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_mail_privacy.py` — `PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF`; `REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS`
- `tests/test_settings_disclosure.py` — `SWITCHING PSEUDONYMISATION OFF STATES WHAT FOLLOWS`

## Acceptance criteria

From the SPEC's checks:

- `PSEUDONYMISATION IS ON UNLESS A PRODUCT SWITCHES IT OFF` — `tests/test_mail_privacy.py` — a product without the setting gets rewritten report data; counter-proof: a product that switched it off gets the original data.
- `REPORT DATA LEAVES THE MAILBOX ONLY REWRITTEN WITHOUT PERSONS` — `tests/test_mail_privacy.py` — a fixture log with a name, a mail address, a phone number, an IP address and a home-directory path, rewritten by a fixture participant, contains none of them; counter-proof: a rewriting that keeps one is refused. How often a rewriting keeps the error message, stack trace and version is measured as a rate on a fixed set of reports, reported, not gated.
- `SWITCHING PSEUDONYMISATION OFF STATES WHAT FOLLOWS` — `tests/test_settings_disclosure.py`

From the postcondition of UC-042 (Manage settings in one place), for the part this item builds:

> - The person has seen every setting Agent M uses, where it is kept, and whether it works.
> - Browser settings changed or cleared here are changed or cleared in `localStorage` itself; repository
>   settings changed here are commits under the person's account.
> - No secret was shown in full except on **Show**, written to a repository, or put into a URL; an export
>   holds them only after the notice.

Further:

- A test fails while the settings page says "stand-in" or "surrogate" anywhere and passes once it names the rewriting without persons (red first).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-006 — edits the settings view after ITM-006 changed its token texts

## Needs a person

No.
