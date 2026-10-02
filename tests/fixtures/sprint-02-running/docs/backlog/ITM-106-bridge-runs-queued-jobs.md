---
id: ITM-106
title: The bridge polls the products it serves and runs the queued jobs of its agents on their own login
kind: implementation
level: 2
realises:
  - A LOCAL AGENT USES THE PERSON'S OWN LOGIN
  - UC-011
  - UC-034
  - UC-024
modules:
  - MOD-bridge-app
depends_on:
  - ITM-102
  - ITM-040
  - ITM-039
  - ITM-008
  - ITM-103
origin: backlog refinement 2026-10-01
---
# ITM-106 The bridge polls the products it serves and runs the queued jobs of its agents on their own login

**REGISTER**

## Outcome

While running, the bridge computes `nextJobs`, takes the queued jobs assigned to its agents and runs them through `runJob` on the `agent-login` authority; quitting the bridge ends its jobs as cancelled (UC-044 7b).

## Realises

- `A LOCAL AGENT USES THE PERSON'S OWN LOGIN`
- UC-011 — Hand a job to a local CLI session
- UC-034 — Implement backlog items with a coding agent
- UC-024 — Implement modules from the architecture

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-bridge-app; ARC-010 decisions 3, 4.

Architecture decisions its modules follow: ARC-003, ARC-011, ARC-017.

## Modules

- MOD-bridge-app (shells) — uses MOD-bridge-server, MOD-bridge-tunnel, MOD-derivation, MOD-git-host, MOD-mailbox, MOD-participants, MOD-run-engine, MOD-settings-store, MOD-test-records

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `bridge/jobs.mjs` (new)
- `bridge/main.mjs`
- `tests/bridge-app.jobs.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **2** — needs the Agent M Bridge on a person's computer.

## Tests the SPEC names

- `tests/test_bridge_agents.py` — `A LOCAL AGENT USES THE PERSON'S OWN LOGIN`

## Acceptance criteria

From the SPEC's checks:

- `A LOCAL AGENT USES THE PERSON'S OWN LOGIN` — `tests/test_bridge_agents.py` — the command the bridge starts carries no key and no key environment variable.

From the postcondition of UC-011 (Hand a job to a local CLI session), for the part this item builds:

> - The artifacts arrived as open; nothing counts as accepted before a person accepts it.
> - The bridge never listened on a non-loopback interface.

From the postcondition of UC-034 (Implement backlog items with a coding agent), for the part this item builds:

> - Each started item has a pull request with failing-then-passing tests. It is either merged on green
>   CI with every gate recorded, or waits, or failed with a reason.
> - No job has continued past a gate without its decider's recorded decision.
> - The dashboards show the new state without anyone setting it (UC-035, UC-036).

From the postcondition of UC-024 (Implement modules from the architecture), for the part this item builds:

> - The code reached the default branch only through a pull request whose CI run was green.
> - The job's first commit was a failing test; the module's tests guard named requirements from now on.
> - Every file the job created or changed names the module it belongs to; no file outside the job's
>   modules was changed.
> - The pull request records who implemented it, with which model and Agent M version, and when.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-102 — the app
- ITM-040 — runJob
- ITM-039 — nextJobs
- ITM-008 — the agent-login authority
- ITM-103 — wires its polling into bridge/main.mjs after the tunnel supervisor

## Needs a person

No.
