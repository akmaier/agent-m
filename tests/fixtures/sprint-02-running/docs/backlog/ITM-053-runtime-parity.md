---
id: ITM-053
title: A runtime is interchangeable — the same job, the same inputs, the same kind of artifact in all three
kind: implementation
level: 2
realises:
  - A RUNTIME IS INTERCHANGEABLE
  - ONE DEFINITION, THREE DRIVERS
modules: []
depends_on:
  - ITM-040
  - ITM-064
  - ITM-061
  - ITM-105
  - ITM-106
origin: backlog refinement 2026-10-01
---
# ITM-053 A runtime is interchangeable — the same job, the same inputs, the same kind of artifact in all three

**REGISTER**

## Outcome

One drafting job definition with fixed inputs and a scripted participant run through the browser route, the CI entry and the bridge yields artifacts of the same kind and the same content.

## Realises

- `A RUNTIME IS INTERCHANGEABLE`
- `ONE DEFINITION, THREE DRIVERS`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — ARC-003, ARC-010 decision 8.

## Modules

- none — a repository check or a measurement: the rule is checked across the repository or by a person, not by one module's code (ARC-020 decision 5).

Files it creates or changes:

- `tests/test_runtime_parity.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **2** — needs the Agent M Bridge on a person's computer.

## Tests the SPEC names

- `tests/test_runtime_parity.py` — `A RUNTIME IS INTERCHANGEABLE`
- `tests/test_single_definition.py` — `ONE DEFINITION, THREE DRIVERS`

## Acceptance criteria

From the SPEC's checks:

- `A RUNTIME IS INTERCHANGEABLE` — `tests/test_runtime_parity.py`
- `ONE DEFINITION, THREE DRIVERS` — `tests/test_single_definition.py` — no prompt or schema text appears in more than one place.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-040 — the one executor
- ITM-064 — the endpoint driver
- ITM-061 — the CI-agent driver
- ITM-105 — the CLI driver
- ITM-106 — the bridge runs jobs

## Needs a person

No.
