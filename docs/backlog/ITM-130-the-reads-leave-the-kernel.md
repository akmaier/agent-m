---
id: ITM-130
title: The reads leave the kernel, and the shells read only through what the git host provides
kind: refactoring
level: 1
realises:
  - EVERY ARTIFACT NAMES ITS ORIGIN
  - UC-024
modules:
  - MOD-review-core
  - MOD-git-host
  - MOD-dashboard-app
depends_on:
  - ITM-126
  - ITM-129
origin: sprint 01 review
---
# ITM-130 The reads leave the kernel, and the shells read only through what the git host provides

**REGISTER**

## Outcome

The second half of what ITM-124 began. The kernel's functions that still read through the git host — `readBlob`,
`recordCommittedAt`, `lastAccepted` and `deriveTarget` in `docs/assets/review-core.mjs`, which call `fetchText` — take
what they read as a port passed in (ARC-003 decision 2, "Ports, not imports"), or move into the git host where MOD-git-host
already provides them (`readBlob` is in its `provides`). `review-core.mjs` then imports nothing from `git-host.mjs`
(MOD-review-core: a kernel module imports only kernel modules, ARC-003 decision 1). The dashboard's files that import
`fetchText` directly — `dashboard-app.mjs`, `dashboard/writes.mjs`, `dashboard/settings-view.mjs` — read through the
functions MOD-git-host provides (`readFile`, `readSnapshot`, `readBlob`, `repositoryInfo` …), since MOD-git-host calls
its request helper internal. Behaviour and expected results stay unchanged.

## Realises

- `EVERY ARTIFACT NAMES ITS ORIGIN`
- UC-024 — Implement modules from the architecture

## Where it came from

Sprint 01 review (`docs/backlog/sprints/sprint-01.md`, *Review*, feedback 15). ITM-124 moved the writes out of the kernel
and left the reads as "a question for the next refinement" (ITM-124, *Notes*).

Architecture decisions its modules follow: ARC-001, ARC-002, ARC-003, ARC-004, ARC-005, ARC-006.

## Modules

- MOD-review-core (kernel) — uses MOD-artifacts
- MOD-git-host (adapters) — uses no other module
- MOD-dashboard-app (shells) — uses MOD-artifacts, MOD-bridge-server, MOD-bridge-tunnel, MOD-ci-generator, MOD-derivation, MOD-git-host, MOD-job-harness, MOD-mail-flow, MOD-mailbox, MOD-participants, MOD-process-model, MOD-pseudonymiser, MOD-review-core, MOD-run-engine, MOD-settings-store, MOD-source-library, MOD-test-records, MOD-traceability, MOD-work-items

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/review-core.mjs` (the four reads take a port or leave)
- `docs/assets/git-host.mjs` (what moves in)
- `docs/assets/dashboard-app.mjs`, `docs/assets/dashboard/writes.mjs`, `docs/assets/dashboard/settings-view.mjs` (reads through the provided functions)
- the test files of the moved checks, moved unchanged
- `tests/review-core.d/dashboard-writes.test.mjs` (the repository check beside ITM-124's: no kernel file imports from the git host; no shell file imports `fetchText`)

## Kind and level

- Job kind: **refactoring** — CI green on every commit, no expected result changed (`A REFACTORING JOB BEGINS WITHOUT A FAILING TEST`, `A REFACTORING JOB CHANGES NO EXPECTED RESULT`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_origin_links.py` — `EVERY ARTIFACT NAMES ITS ORIGIN`

## Acceptance criteria

- Every test green before is green after, with no assertion changed: the diff of the test files shows moved blocks, import lines and header lines only.
- `review-core.mjs` imports nothing from `git-host.mjs`; no file of MOD-dashboard-app imports `fetchText`; the repository check refuses a planted import of either, recorded with the change.
- If a direct read of the dashboard has no counterpart among the functions MOD-git-host provides, the item stops there and that read becomes a change request to `akmaier` for MOD-git-host's interface (`docs/process.md`, *Boundary*) — the code does not decide the interface.
- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- CI is green on every commit and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-126 — changes `docs/assets/dashboard/writes.mjs` first
- ITM-129 — changes `docs/assets/dashboard-app.mjs` first

## Needs a person

No — unless a read has no provided counterpart (see the acceptance criteria).
