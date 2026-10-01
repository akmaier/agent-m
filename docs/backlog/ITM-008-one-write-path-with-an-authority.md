---
id: ITM-008
title: One write path that takes an authority — click, CI secret or agent login
kind: implementation
level: 1
realises:
  - THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK
  - A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
  - A LOCAL AGENT USES THE PERSON'S OWN LOGIN
  - A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE
modules:
  - MOD-git-host
  - MOD-dashboard-app
depends_on:
  - ITM-007
origin: backlog refinement 2026-10-01
---
# ITM-008 One write path that takes an authority — click, CI secret or agent login

**REGISTER**

## Outcome

`MOD-git-host.commitFiles` (with its GitLab twin) becomes the one write path of ARC-003 decision 3: it takes an `authority` of kind `click`, `ci-secret` or `agent-login` and refuses a write without one; it knows nothing of a page or a click. The dashboard alone creates a `click` authority, and only from an event the browser marks as trusted (`isTrusted`) on the button that names the write. Issue, pull-request, workflow and tag calls take the same authority (ITM-055, ITM-054). The request and commit helpers become importable by the module's other files, so that later git-host items add files of their own.

## Realises

- `THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK`
- `A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET`
- `A LOCAL AGENT USES THE PERSON'S OWN LOGIN`
- `A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — ARC-003 decision 3, ARC-004 decision 4; MOD-git-host `commitFiles`.

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-004, ARC-005, ARC-006.

## Modules

- MOD-git-host (adapters) — uses no other module
- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/git-host.mjs`
- `docs/assets/dashboard-app.mjs`
- `docs/assets/dashboard/review-views.mjs` (write calls)
- `docs/assets/dashboard/spec-changes-view.mjs` (write calls)
- `docs/assets/dashboard/settings-view.mjs` (write calls)
- `docs/assets/dashboard/add-product-view.mjs` (write calls)
- `docs/assets/dashboard/setup-view.mjs` (write calls)
- `tests/review-core.test.mjs` (the click tests)
- `tests/review-core.d/authority.test.mjs`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/review-core.test.mjs` — `THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK`; `A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE`
- `tests/test_bridge_agents.py` — `A LOCAL AGENT USES THE PERSON'S OWN LOGIN`
- `tests/test_runtime_levels.py` — `A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET`

## Acceptance criteria

From the SPEC's checks:

- `THE DASHBOARD WRITES ONLY ON A PERSON'S CLICK` — `tests/review-core.test.mjs`
- `A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET` — `tests/test_runtime_levels.py` — the generated job workflow authenticates its pushes and pull requests with the named secret; counter-proof: a workflow that uses `GITHUB_TOKEN` for them fails.
- `A LOCAL AGENT USES THE PERSON'S OWN LOGIN` — `tests/test_bridge_agents.py` — the command the bridge starts carries no key and no key environment variable.
- `A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE` — `tests/review-core.test.mjs`

Further:

- A write without an authority, or with a `click` authority built from an untrusted event, sends no request; with a trusted click it writes one commit (counter-proof).
- An `agent-login` or `ci-secret` authority can be made only by the bridge app or the CI entry (checked by a repository check that no other module constructs one).
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-007 — changes every view's write call after the last text fix in the settings view

## Needs a person

No.
