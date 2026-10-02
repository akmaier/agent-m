---
id: ITM-027
title: Process model definitions — read and validated before use
kind: implementation
level: 1
realises:
  - A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED
  - A GATE NAMES WHAT IT CHECKS
  - A GATE NAMES WHO DECIDES IT
modules:
  - MOD-process-model
depends_on:
  - ITM-004
origin: backlog refinement 2026-10-01
---
# ITM-027 Process model definitions — read and validated before use

**REGISTER**

## Outcome

`parseModel(text)` and `validateModel(model)` over the Markdown tables of ARC-019 decision 1, with one broken fixture per rule the SPEC and UC-031 step 4 list. The instance's own `docs/process-models/scrum-wip.md` (Agent M's declared model) validates without an error.

## Realises

- `A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED`
- `A GATE NAMES WHAT IT CHECKS`
- `A GATE NAMES WHO DECIDES IT`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-process-model `parseModel`, `validateModel`; ARC-019 decisions 1, 2.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-019.

## Modules

- MOD-process-model (kernel) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/process-model.mjs` (new)
- `tests/test_model_validation.py`
- `tests/test_gate_definition.py`
- `tests/fixtures/process-models/`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_gate_definition.py` — `A GATE NAMES WHAT IT CHECKS`
- `tests/test_model_validation.py` — `A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED`; `A GATE NAMES WHO DECIDES IT`

## Acceptance criteria

From the SPEC's checks:

- `A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED` — `tests/test_model_validation.py`. Each rule has a definition that breaks it and must be rejected: a transition naming a phase the model lacks, a verification pair naming a phase the model lacks, a gate without artifacts or condition, a role without capabilities, a phase without a role, a missing declaration of whether work is planned or pulled from a backlog. Each book model in the shipped catalogue must pass.
- `A GATE NAMES WHAT IT CHECKS` — `tests/test_gate_definition.py`
- `A GATE NAMES WHO DECIDES IT` — `tests/test_model_validation.py` — a gate without a decider is rejected; counter-proof: a gate decided by a role and one decided by a named CI check both pass validation.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-004 — test-file conventions

## Needs a person

No.
