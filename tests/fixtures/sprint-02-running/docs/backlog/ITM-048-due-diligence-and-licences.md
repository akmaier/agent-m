---
id: ITM-048
title: Due diligence fetched from registries, and licence compatibility as data
kind: implementation
level: 1
realises:
  - A REUSE DECISION RECORDS ITS DUE DILIGENCE
  - A PRODUCT DECLARES ITS LICENCE
  - A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S
  - DUE DILIGENCE IS FETCHED, NOT RECALLED
modules:
  - MOD-source-library
depends_on:
  - ITM-004
origin: backlog refinement 2026-10-01
---
# ITM-048 Due diligence fetched from registries, and licence compatibility as data

**REGISTER**

## Outcome

`dueDiligence(candidate, fetchers)` — existence, licence, release dates, issues, adoption, each fact with address and date; a package not found reported as possibly invented — and `licenceCompatibility` over a table that is data; an unknown pair is marked, never passed. Commit tests use recorded registry answers.

## Realises

- `A REUSE DECISION RECORDS ITS DUE DILIGENCE`
- `A PRODUCT DECLARES ITS LICENCE`
- `A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S`
- `DUE DILIGENCE IS FETCHED, NOT RECALLED`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-source-library `dueDiligence`, `licenceCompatibility`.

Architecture decisions its modules follow: ARC-003, ARC-006.

## Modules

- MOD-source-library (features) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/source-library/due-diligence.mjs` (new)
- `docs/assets/source-library/licences.json` (new)
- `tests/test_reuse_due_diligence.py`
- `tests/fixtures/registries/`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_reuse_due_diligence.py` — `A REUSE DECISION RECORDS ITS DUE DILIGENCE`; `A PRODUCT DECLARES ITS LICENCE`; `A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S`; `DUE DILIGENCE IS FETCHED, NOT RECALLED`

## Acceptance criteria

From the SPEC's checks:

- `A REUSE DECISION RECORDS ITS DUE DILIGENCE` — `tests/test_reuse_due_diligence.py`
- `A PRODUCT DECLARES ITS LICENCE` — `tests/test_reuse_due_diligence.py`
- `A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S` — `tests/test_reuse_due_diligence.py` — a GPL-3.0 candidate for an MIT product is marked; counter-proof: an MIT candidate is not.
- `DUE DILIGENCE IS FETCHED, NOT RECALLED` — `tests/test_reuse_due_diligence.py` — a record with a fact lacking address or date fails; counter-proof with a record whose package does not exist in the registry.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-004 — test-file conventions

## Needs a person

No.

## Notes

Whether the registries answer a page's cross-origin request is not measured; UC-022 7b names the fallback (a participant that can reach the web).
