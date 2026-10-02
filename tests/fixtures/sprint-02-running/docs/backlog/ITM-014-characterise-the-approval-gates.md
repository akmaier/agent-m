---
id: ITM-014
title: Characterise the approval gates the code already keeps — the checks the SPEC names, with counter-proofs
kind: refactoring
level: 1
realises:
  - A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN
  - THE APPROVED TEXT IS TAKEN VERBATIM
  - NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT
  - THE REPLACED TEXT STAYS REACHABLE
  - A GENERATED ARTIFACT IS A PROPOSAL
  - A RECORD IS EVIDENCE, NOT A PROPOSAL
  - A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN
modules:
  - MOD-review-core
depends_on:
  - ITM-004
origin: backlog refinement 2026-10-01
---
# ITM-014 Characterise the approval gates the code already keeps — the checks the SPEC names, with counter-proofs

**REGISTER**

## Outcome

The behaviour exists (`planAcceptance`, `replaceSection`, the approval view); the checks the SPEC names do not. This item writes them against fixture repositories and records for each a planted fault that turns it red, without changing code. A job record without an approval record is not listed as open; a use case without one is.

## Realises

- `A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN`
- `THE APPROVED TEXT IS TAKEN VERBATIM`
- `NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT`
- `THE REPLACED TEXT STAYS REACHABLE`
- `A GENERATED ARTIFACT IS A PROPOSAL`
- `A RECORD IS EVIDENCE, NOT A PROPOSAL`
- `A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-review-core; the SPEC's check fields name these files, which do not exist yet.

Architecture decisions its modules follow: ARC-003, ARC-006.

## Modules

- MOD-review-core (kernel) — uses MOD-artifacts

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `tests/test_spec_gate.py`
- `tests/test_verbatim.py`
- `tests/test_proposal_shows_current.py`
- `tests/test_replaced_in_history.py`
- `tests/review-core.d/gates.test.mjs`
- `tests/fixtures/gates/`
- `docs/measurements/<date>_approval-gates-counter-proofs.md` (new)

## Kind and level

- Job kind: **refactoring** — CI green on every commit, no expected result changed (`A REFACTORING JOB BEGINS WITHOUT A FAILING TEST`, `A REFACTORING JOB CHANGES NO EXPECTED RESULT`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `A GENERATED ARTIFACT IS A PROPOSAL`; `A RECORD IS EVIDENCE, NOT A PROPOSAL`; `A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN`
- `tests/test_proposal_shows_current.py` — `NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT`
- `tests/test_replaced_in_history.py` — `THE REPLACED TEXT STAYS REACHABLE`
- `tests/test_spec_gate.py` — `A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN`
- `tests/test_verbatim.py` — `THE APPROVED TEXT IS TAKEN VERBATIM`

## Acceptance criteria

From the SPEC's checks:

- `A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN` — `tests/test_spec_gate.py`
- `THE APPROVED TEXT IS TAKEN VERBATIM` — `tests/test_verbatim.py`
- `NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT` — `tests/test_proposal_shows_current.py`
- `THE REPLACED TEXT STAYS REACHABLE` — `tests/test_replaced_in_history.py`
- `A GENERATED ARTIFACT IS A PROPOSAL` — `tests/review-core.test.mjs` — a file without an approval record naming its current text is shown as open.
- `A RECORD IS EVIDENCE, NOT A PROPOSAL` — `tests/review-core.test.mjs` — a job record without approval is not listed as open; counter-proof: a use case without approval is.
- `A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN` — `tests/review-core.test.mjs`

Further:

- Each new check is shown red on a planted fault and green on the restored code; the mutations are listed in the dated measurement file (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-004 — adds its checks under tests/review-core.d/

## Needs a person

No.

## Notes

Kind refactoring because it adds checks for existing behaviour and changes no expected result; if a check fails on the current code, the item stops and the failure becomes an implementation item.
