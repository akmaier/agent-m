---
id: ITM-125
title: The export notice says what the GitHub token grants — pull requests included
kind: implementation
level: 1
realises:
  - ONE GITHUB TOKEN SERVES EVERY FEATURE
  - AN EXPORT STATES THAT IT CONTAINS SECRETS
modules:
  - MOD-settings-store
depends_on: []
origin: sprint 01 review
---
# ITM-125 The export notice says what the GitHub token grants — pull requests included

**REGISTER**

## Outcome

The grant `MOD-settings-store` gives the GitHub token for the export notice (`docs/assets/settings-store.mjs`, today
"writes — commits, issues and workflow runs — to every repository it was given, under your account") names every write
the one token carries since ITM-006: commits, issues, pull requests and workflow runs. The notice then states what the
token grants as `AN EXPORT STATES THAT IT CONTAINS SECRETS` asks, in line with the permissions of `ONE GITHUB TOKEN SERVES
EVERY FEATURE`.

## Realises

- `ONE GITHUB TOKEN SERVES EVERY FEATURE`
- `AN EXPORT STATES THAT IT CONTAINS SECRETS`

## Where it came from

Sprint 01 review (`docs/backlog/sprints/sprint-01.md`, *Review*, feedback 14): the developer of ITM-006 found the text and
left it, because MOD-settings-store was not among ITM-006's modules (pull request #31, *For review*).

Architecture decisions its modules follow: ARC-003, ARC-005.

## Modules

- MOD-settings-store (adapters) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/settings-store.mjs` (the grant of the GitHub token)
- `tests/test_settings_disclosure.py` (the grant names pull requests)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_settings_disclosure.py` — `AN EXPORT STATES THAT IT CONTAINS SECRETS`

## Acceptance criteria

- `AN EXPORT STATES THAT IT CONTAINS SECRETS` — `tests/test_settings_disclosure.py` — the GitHub token's grant in the export notice names pull requests beside commits, issues and workflow runs; counter-proof: the text of today fails.
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- nothing

## Needs a person

No.
