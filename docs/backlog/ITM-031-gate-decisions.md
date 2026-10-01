---
id: ITM-031
title: Gate decisions — passed only by the decider's record, never by the participant whose work it checks
kind: implementation
level: 1
realises:
  - A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS
modules:
  - MOD-process-model
depends_on:
  - ITM-027
origin: backlog refinement 2026-10-01
---
# ITM-031 Gate decisions — passed only by the decider's record, never by the participant whose work it checks

**REGISTER**

## Outcome

`gateDecision(gate, records, workParticipant)`: passed by a record of the gate's decider — a role holder, an agent or a named CI check —, waiting otherwise with the deciders named; a record by the working participant does not count.

## Realises

- `A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-process-model `gateDecision`.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-019.

## Modules

- MOD-process-model (kernel) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/process-model/gates.mjs` (new)
- `tests/test_job_gate.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_job_gate.py` — `A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS`

## Acceptance criteria

From the SPEC's checks:

- `A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS` — `tests/test_job_gate.py` — the implementing agent's own record leaves the job waiting; counter-proof: a second agent holding the deciding role passes it.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-027 — gates and deciders

## Needs a person

No.
