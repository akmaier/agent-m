---
id: ITM-054
title: An append-only results branch and tags that never move
kind: implementation
level: 1
realises:
  - A RESULT RECORD IS NEVER REWRITTEN
  - A VERSION IS NOT REWRITTEN
modules:
  - MOD-git-host
depends_on:
  - ITM-008
origin: backlog refinement 2026-10-01
---
# ITM-054 An append-only results branch and tags that never move

**REGISTER**

## Outcome

`appendRecords` adds new files to the branch `test-results`, refusing any file that exists, never forcing; `tags().create` refuses an existing tag; both on GitHub and GitLab.

## Realises

- `A RESULT RECORD IS NEVER REWRITTEN`
- `A VERSION IS NOT REWRITTEN`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-git-host `appendRecords`, `tags`; ARC-006 (the test-results branch).

Architecture decisions its modules follow: ARC-001, ARC-003, ARC-004, ARC-006.

## Modules

- MOD-git-host (adapters) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/git-host/records-and-tags.mjs` (new)
- `tests/test_tags_immutable.py`
- `tests/git-host.records.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_result_records.py` — `A RESULT RECORD IS NEVER REWRITTEN`
- `tests/test_tags_immutable.py` — `A VERSION IS NOT REWRITTEN`

## Acceptance criteria

From the SPEC's checks:

- `A RESULT RECORD IS NEVER REWRITTEN` — `tests/test_result_records.py` — the branch's history is checked for rewritten or deleted records; counter-proof with a fixture that amends one.
- `A VERSION IS NOT REWRITTEN` — `tests/test_tags_immutable.py`

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-008 — writes through the authority write path

## Needs a person

No.
