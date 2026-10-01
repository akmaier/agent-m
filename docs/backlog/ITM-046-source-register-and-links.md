---
id: ITM-046
title: The source register and a product's links — kinds, authority, licence, versions by identifier and hash
kind: implementation
level: 1
realises:
  - THE SOURCE MODEL IS GENERIC
  - A SOURCE DECLARES ITS AUTHORITY
  - A LIVING SOURCE IS PINNED
  - THE SOURCE KIND IS ONE OF A CLOSED SET
  - THE INSTANCE KEEPS THE SOURCE REGISTER
  - A PRODUCT LINKS THE SOURCES THAT APPLY
  - A LINK NAMES THE PART THAT APPLIES
  - A SOURCE IS FILES, AN ARCHIVE OR A REPOSITORY
  - A SOURCE DECLARES ITS LICENCE
  - RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE
  - A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH
  - A SOURCE VERSION IS NEVER OVERWRITTEN
  - A STANDARD IS REGISTERED BY ITS DESIGNATION
modules:
  - MOD-source-library
depends_on:
  - ITM-004
origin: backlog refinement 2026-10-01
---
# ITM-046 The source register and a product's links — kinds, authority, licence, versions by identifier and hash

**REGISTER**

## Outcome

`parseSource`, `validateSource`, `parseSourceLinks`, `hashFiles` (in the browser, sending nothing) and `contentLabels` of MOD-source-library over `docs/sources/SRC-<slug>.md` and a product's `docs/sources.md`.

## Realises

- `THE SOURCE MODEL IS GENERIC`
- `A SOURCE DECLARES ITS AUTHORITY`
- `A LIVING SOURCE IS PINNED`
- `THE SOURCE KIND IS ONE OF A CLOSED SET`
- `THE INSTANCE KEEPS THE SOURCE REGISTER`
- `A PRODUCT LINKS THE SOURCES THAT APPLY`
- `A LINK NAMES THE PART THAT APPLIES`
- `A SOURCE IS FILES, AN ARCHIVE OR A REPOSITORY`
- `A SOURCE DECLARES ITS LICENCE`
- `RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE`
- `A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH`
- `A SOURCE VERSION IS NEVER OVERWRITTEN`
- `A STANDARD IS REGISTERED BY ITS DESIGNATION`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-source-library.

Architecture decisions its modules follow: ARC-003, ARC-006.

## Modules

- MOD-source-library (features) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/source-library.mjs` (new)
- `tests/test_source_register.py`
- `tests/test_source_authority.py`
- `tests/test_source_pinned.py`
- `tests/test_source_kind.py`
- `tests/test_source_links.py`
- `tests/test_source_model.py`
- `tests/fixtures/sources/`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_source_authority.py` — `A SOURCE DECLARES ITS AUTHORITY`
- `tests/test_source_kind.py` — `THE SOURCE KIND IS ONE OF A CLOSED SET`
- `tests/test_source_links.py` — `A PRODUCT LINKS THE SOURCES THAT APPLY`; `A LINK NAMES THE PART THAT APPLIES`
- `tests/test_source_model.py` — `THE SOURCE MODEL IS GENERIC`
- `tests/test_source_pinned.py` — `A LIVING SOURCE IS PINNED`
- `tests/test_source_register.py` — `THE INSTANCE KEEPS THE SOURCE REGISTER`; `A SOURCE IS FILES, AN ARCHIVE OR A REPOSITORY`; `A SOURCE DECLARES ITS LICENCE`; `RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE`; `A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH`; `A SOURCE VERSION IS NEVER OVERWRITTEN`; `A STANDARD IS REGISTERED BY ITS DESIGNATION`

## Acceptance criteria

From the SPEC's checks:

- `THE SOURCE MODEL IS GENERIC` — `tests/test_source_model.py` — no source identifier appears in Agent M's own code.
- `A SOURCE DECLARES ITS AUTHORITY` — `tests/test_source_authority.py`
- `A LIVING SOURCE IS PINNED` — `tests/test_source_pinned.py`
- `THE SOURCE KIND IS ONE OF A CLOSED SET` — `tests/test_source_kind.py`
- `THE INSTANCE KEEPS THE SOURCE REGISTER` — `tests/test_source_register.py`
- `A PRODUCT LINKS THE SOURCES THAT APPLY` — `tests/test_source_links.py`
- `A LINK NAMES THE PART THAT APPLIES` — `tests/test_source_links.py`
- `A SOURCE IS FILES, AN ARCHIVE OR A REPOSITORY` — `tests/test_source_register.py`
- `A SOURCE DECLARES ITS LICENCE` — `tests/test_source_register.py`
- `RESTRICTED CONTENT STAYS OUT OF THE PUBLIC INSTANCE` — `tests/test_source_register.py`
- `A SOURCE VERSION IS FIXED BY IDENTIFIER AND HASH` — `tests/test_source_register.py`
- `A SOURCE VERSION IS NEVER OVERWRITTEN` — `tests/test_source_register.py`
- `A STANDARD IS REGISTERED BY ITS DESIGNATION` — `tests/test_source_register.py`

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-004 — test-file conventions

## Needs a person

No.
