---
id: ITM-020
title: A requirement's history — every accepted change with date, person and the text before and after
kind: implementation
level: 1
realises:
  - A REQUIREMENT SHOWS ITS HISTORY
modules:
  - MOD-review-core
depends_on:
  - ITM-019
  - ITM-009
origin: backlog refinement 2026-10-01
---
# ITM-020 A requirement's history — every accepted change with date, person and the text before and after

**REGISTER**

## Outcome

`MOD-review-core.requirementHistory(name, records, sectionAt)` lists every accepted change to a requirement's text from the approval records and the texts of its section at each accepting commit (`sectionAt` a port); a section written before any record shows the commit that introduced it and says no record names it (UC-020 5d).

## Realises

- `A REQUIREMENT SHOWS ITS HISTORY`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-review-core `requirementHistory`.

Architecture decisions its modules follow: ARC-003, ARC-006.

## Modules

- MOD-review-core (kernel) — uses MOD-artifacts

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/review-core/history.mjs` (new)
- `tests/test_spec_browser.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_spec_browser.py` — `A REQUIREMENT SHOWS ITS HISTORY`

## Acceptance criteria

From the SPEC's checks:

- `A REQUIREMENT SHOWS ITS HISTORY` — `tests/test_spec_browser.py`

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-019 — extends tests/test_spec_browser.py
- ITM-009 — reads requirements

## Needs a person

No.
