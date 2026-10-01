---
id: ITM-010
title: Use cases checked in the dashboard's reader as in the Python twin — realised names, Mermaid, identifier kept
kind: implementation
level: 1
realises:
  - A USE CASE REALISES NAMED REQUIREMENTS
  - A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION
  - DIAGRAMS ARE MERMAID IN MARKDOWN
  - ONE USE CASE, ONE FILE
  - AN EDITED FILE KEEPS ITS IDENTIFIER
modules:
  - MOD-artifacts
depends_on:
  - ITM-004
origin: backlog refinement 2026-10-01
---
# ITM-010 Use cases checked in the dashboard's reader as in the Python twin — realised names, Mermaid, identifier kept

**REGISTER**

## Outcome

`MOD-artifacts.parseUseCase` and `useCaseProblems(path, text, knownNames)` check the five parts, a Mermaid block, no diagram stored as an image, the identifier matching the file name, and every name under `realises` against the known requirements. `tests/artifacts-twin.test.mjs` runs the JavaScript reader and `tests/artifact_checks.py` on the same fixtures and compares their findings, so that the two readers cannot drift (MOD-artifacts, Testing).

## Realises

- `A USE CASE REALISES NAMED REQUIREMENTS`
- `A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION`
- `DIAGRAMS ARE MERMAID IN MARKDOWN`
- `ONE USE CASE, ONE FILE`
- `AN EDITED FILE KEEPS ITS IDENTIFIER`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-artifacts `parseUseCase`, `useCaseProblems`, `identifierKept`.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-020.

## Modules

- MOD-artifacts (kernel) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/artifacts/use-cases.mjs` (new)
- `tests/test_usecase_realises.py`
- `tests/test_diagrams_are_mermaid.py`
- `tests/artifacts-twin.test.mjs` (new)
- `tests/fixtures/use-cases/`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `AN EDITED FILE KEEPS ITS IDENTIFIER`
- `tests/test_diagrams_are_mermaid.py` — `DIAGRAMS ARE MERMAID IN MARKDOWN`
- `tests/test_usecase_fields.py` — `A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION`; `ONE USE CASE, ONE FILE`
- `tests/test_usecase_realises.py` — `A USE CASE REALISES NAMED REQUIREMENTS`

## Acceptance criteria

From the SPEC's checks:

- `A USE CASE REALISES NAMED REQUIREMENTS` — `tests/test_usecase_realises.py`
- `A USE CASE HAS ACTOR, PRECONDITION, FLOW AND POSTCONDITION` — `tests/test_usecase_fields.py`
- `DIAGRAMS ARE MERMAID IN MARKDOWN` — `tests/test_diagrams_are_mermaid.py`
- `ONE USE CASE, ONE FILE` — `tests/test_usecase_fields.py`
- `AN EDITED FILE KEEPS ITS IDENTIFIER` — `tests/review-core.test.mjs`

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-004 — test-file conventions

## Needs a person

No.
