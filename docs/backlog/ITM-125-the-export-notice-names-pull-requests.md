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
  - MOD-dashboard-app
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
- MOD-dashboard-app (shells) — only for `tests/test_settings_disclosure.py` and the one asserted sentence in `tests/dashboard-review-flows.test.mjs` (*From the sprint 02 review of ITM-125*)

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/settings-store.mjs` (the grant of the GitHub token)
- `tests/test_settings_disclosure.py` (the grant names pull requests)
- `tests/dashboard-review-flows.test.mjs` (UC-042 step 6: the asserted export notice gains "pull requests"; nothing else in the file)

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

## From the sprint 02 review of ITM-125

developer-opus-d stopped before the first commit (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`): the test
this item names for `AN EXPORT STATES THAT IT CONTAINS SECRETS`, `tests/test_settings_disclosure.py`, carries
`Module: MOD-dashboard-app`, and `tests/dashboard-review-flows.test.mjs` (MOD-dashboard-app, the characterisation
tests of ITM-123) asserts the export notice of today word for word — with the new grant it goes red (64/65). The
sprint's caller table had listed ITM-125 under "no caller outside the item's modules"; the asserted sentence was not
looked for. MOD-dashboard-app is therefore among its modules for those two test files only:

- `tests/test_settings_disclosure.py` — gains the assertion the item names (the grant names pull requests beside
  commits, issues and workflow runs); it is the item's red test.
- `tests/dashboard-review-flows.test.mjs` — the one asserted sentence of UC-042 step 6 changes to the new grant;
  nothing else in the file. A characterisation test pins what the dashboard shows; the sentence it pins comes
  from `settingKeys` in `docs/assets/settings-store.mjs`, so the changed expectation changes nothing the
  dashboard does.

No code file of MOD-dashboard-app changes. The first commit holds both test changes and is red on both for the
same reason (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`); the second commit changes the grant in
`docs/assets/settings-store.mjs` and turns both green. A further unit assertion in
`tests/review-core.d/settings-store.test.mjs` (MOD-settings-store) is allowed, not required. (po-fable, 2026-10-01)
