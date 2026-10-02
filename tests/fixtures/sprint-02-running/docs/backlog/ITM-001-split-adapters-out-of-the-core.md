---
id: ITM-001
title: Split the adapters out of review-core.mjs — git host, browser store, tunnel commands
kind: refactoring
level: 1
realises:
  - EVERY ARTIFACT NAMES ITS ORIGIN
  - UC-024
modules:
  - MOD-review-core
  - MOD-git-host
  - MOD-settings-store
  - MOD-bridge-tunnel
  - MOD-dashboard-app
depends_on: []
origin: backlog refinement 2026-10-01
---
# ITM-001 Split the adapters out of review-core.mjs — git host, browser store, tunnel commands

**REGISTER**

## Outcome

The code that talks to git servers (`fetchText`, `authHeaders`, the GitLab functions, `commitFiles`, `commitFilesGitLab`, `writeFiles`, `writeRoute`, `parseProductAddress`, the web links, `tokenRefusal`) moves from `review-core.mjs` into `docs/assets/git-host.mjs`; the settings export, import and merge (`exportSettings`, `readSettingsFile`, `mergeSettings`) and the list of browser keys (`BROWSER_SETTINGS`, as `settingKeys`) move into `settings-store.mjs`; the jump-host and tunnel functions (`jumpHostProblem`, `nextFreePort`, `addRemoteSession`, `tunnelBindProblems`, `tunnelCommands`, `probeLocalPort`) move into `docs/assets/bridge-tunnel.mjs`. Each code file carries one line `Module: MOD-<slug>` among its first 20 lines (ARC-020 decision 1). `tests/jsrun.py` can import any module file by name, so later Python checks need no change to it. Behaviour, function signatures and every expected result stay as they are; only imports and the namespace a test calls a function under change.

## Realises

- `EVERY ARTIFACT NAMES ITS ORIGIN`
- UC-024 — Implement modules from the architecture

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — ARC-003 (consequence: splitting `review-core.mjs` is a refactoring job), ARC-004, ARC-005, ARC-013.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-004, ARC-005, ARC-006, ARC-013.

## Modules

- MOD-review-core (kernel) — uses MOD-artifacts
- MOD-git-host (adapters) — uses no other module
- MOD-settings-store (adapters) — uses no other module
- MOD-bridge-tunnel (adapters) — uses no other module
- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/review-core.mjs`
- `docs/assets/git-host.mjs` (new)
- `docs/assets/bridge-tunnel.mjs` (new)
- `docs/assets/settings-store.mjs`
- `docs/assets/review-app.mjs`
- `tests/jsrun.py`
- `tests/app-harness.mjs`
- `tests/*.test.mjs` (imports only)
- `tests/test_*.py` (the namespace a function is called under, only)

## Kind and level

- Job kind: **refactoring** — CI green on every commit, no expected result changed (`A REFACTORING JOB BEGINS WITHOUT A FAILING TEST`, `A REFACTORING JOB CHANGES NO EXPECTED RESULT`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_origin_links.py` — `EVERY ARTIFACT NAMES ITS ORIGIN`

## Acceptance criteria

From the SPEC's checks:

- `EVERY ARTIFACT NAMES ITS ORIGIN` — `tests/test_origin_links.py`

From the postcondition of UC-024 (Implement modules from the architecture), for the part this item builds:

> - The code reached the default branch only through a pull request whose CI run was green.
> - The job's first commit was a failing test; the module's tests guard named requirements from now on.
> - Every file the job created or changed names the module it belongs to; no file outside the job's
>   modules was changed.
> - The pull request records who implemented it, with which model and Agent M version, and when.

Further:

- Every test that was green before is green after, with no assertion changed (diff of the test files shows import and namespace lines only).
- `review-core.mjs`, `git-host.mjs`, `bridge-tunnel.mjs` and `settings-store.mjs` each name exactly one module in a `Module:` line among their first 20 lines.
- `tests/test_config_client_side.py` still finds `settings-store.mjs` as the only file that touches browser storage; the no-direct-`fetch` check of `tests/review-core.test.mjs` still holds for the app.
- Tests whose check field in SPEC.md names `tests/review-core.test.mjs` stay in that file (see the change request on ARC-016 decision 1 in the backlog's return).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- nothing

## Needs a person

No.

## Notes

The write path keeps its `click` parameter here; turning it into the `authority` of ARC-003 decision 3 changes behaviour and is ITM-008. HTML builders and person-facing texts move in ITM-003.
