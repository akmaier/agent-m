---
id: ITM-049
title: EU legal texts fetched in the instance's CI from the EU's publication repository
kind: implementation
level: 1
realises:
  - AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY
  - UC-004
modules:
  - MOD-source-library
  - MOD-ci-entry
depends_on:
  - ITM-046
  - ITM-060
origin: backlog refinement 2026-10-01
---
# ITM-049 EU legal texts fetched in the instance's CI from the EU's publication repository

**REGISTER**

## Outcome

`fetchLegalText(celexOrEli, fetch)` and the CI entry's `legal-text` step: the official text with retrieval date, the repository's version identifier and its SHA-256 committed beside the register entry; a failed fetch leaves the error in the entry and guesses nothing. Commit tests use a recorded Cellar answer.

## Realises

- `AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY`
- UC-004 — Register a requirement source in the library

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-source-library `fetchLegalText`, MOD-ci-entry (`legal-text` step).

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-010, ARC-015.

## Modules

- MOD-source-library (features) — uses no other module
- MOD-ci-entry (shells) — uses MOD-artifacts, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-participants, MOD-process-model, MOD-review-core, MOD-run-engine, MOD-source-library, MOD-test-records

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/source-library/legal-text.mjs` (new)
- `tools/ci-entry/legal-text.mjs` (new)
- `.github/workflows/fetch-legal-text.yml` (new)
- `tests/test_fetch_legal_text.py`
- `tests/fixtures/eur-lex/`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_fetch_legal_text.py` — `AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY`

## Acceptance criteria

From the SPEC's checks:

- `AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY` — `tests/test_fetch_legal_text.py`

From the postcondition of UC-004 (Register a requirement source in the library), for the part this item builds:

> - The library lists the source with kind, authority, licence and at least one version, each version
>   with identifier, date and the SHA-256 of every file read.
> - No restricted content is in the public instance repository.
> - Products can now link to the source (UC-015).

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-046 — the register entry it completes
- ITM-060 — the CI entry's dispatcher

## Needs a person

No.
