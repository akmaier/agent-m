---
id: ITM-011
title: Identifiers, their stability, origin links, and the Module, Guards and Level lines of code and tests
kind: implementation
level: 1
realises:
  - EVERY ARTIFACT HAS AN IDENTIFIER
  - THE NAME IS THE ID AND IT SURVIVES
  - EVERY ARTIFACT NAMES ITS ORIGIN
  - EVERY TEST HAS ONE LEVEL
modules:
  - MOD-artifacts
depends_on:
  - ITM-004
origin: backlog refinement 2026-10-01
---
# ITM-011 Identifiers, their stability, origin links, and the Module, Guards and Level lines of code and tests

**REGISTER**

## Outcome

`MOD-artifacts.headerTags(path, text)` reads `Module:`, `Guards:` (names separated by `; `) and `Level:` among a file's first 20 lines and the `TST-` identifiers of its cases. Identifier checks cover every artifact kind (`SRC-` `UC-` `ARC-` `MOD-` `TST-` `ITM-` `RES-` `JOB-`, a requirement by its name); the stability check compares two versions of a fixture repository and fails on an identifier that disappeared without a withdrawal note; the origin check finds a use case, decision, module, code file or test that names nothing it descends from.

## Realises

- `EVERY ARTIFACT HAS AN IDENTIFIER`
- `THE NAME IS THE ID AND IT SURVIVES`
- `EVERY ARTIFACT NAMES ITS ORIGIN`
- `EVERY TEST HAS ONE LEVEL`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-artifacts `headerTags`; ARC-020 decisions 1, 2, 4.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-020.

## Modules

- MOD-artifacts (kernel) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/artifacts/headers.mjs` (new)
- `docs/assets/artifacts/identity.mjs` (new)
- `tests/test_identifiers.py`
- `tests/test_identifier_stability.py`
- `tests/test_origin_links.py`
- `tests/test_test_levels.py`
- `tests/fixtures/identity/`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_identifier_stability.py` — `THE NAME IS THE ID AND IT SURVIVES`
- `tests/test_identifiers.py` — `EVERY ARTIFACT HAS AN IDENTIFIER`
- `tests/test_origin_links.py` — `EVERY ARTIFACT NAMES ITS ORIGIN`
- `tests/test_test_levels.py` — `EVERY TEST HAS ONE LEVEL`

## Acceptance criteria

From the SPEC's checks:

- `EVERY ARTIFACT HAS AN IDENTIFIER` — `tests/test_identifiers.py`
- `THE NAME IS THE ID AND IT SURVIVES` — `tests/test_identifier_stability.py` — an identifier present in an earlier version and absent now must carry a withdrawal note.
- `EVERY ARTIFACT NAMES ITS ORIGIN` — `tests/test_origin_links.py`
- `EVERY TEST HAS ONE LEVEL` — `tests/test_test_levels.py`

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-004 — the existing tests already carry the header lines this item reads

## Needs a person

No.
