---
id: ITM-029
title: The instance's participants and who may hold a role
kind: implementation
level: 1
realises:
  - PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE
  - A PARTICIPANT HAS ONE OF FIVE TYPES
  - A PARTICIPANT DECLARES ITS CAPABILITIES
  - A PARTICIPANT DECLARES WHERE IT PROCESSES DATA
  - A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL
  - A PROCESS MODEL ORGANISES PEOPLE AND AGENTS
  - A ROLE NAMES THE CAPABILITIES IT NEEDS
  - UC-017
modules:
  - MOD-process-model
depends_on:
  - ITM-027
origin: backlog refinement 2026-10-01
---
# ITM-029 The instance's participants and who may hold a role

**REGISTER**

## Outcome

`parseParticipants(text)` reads `docs/participants.md` (ARC-019 decision 5) — name, type, model, capabilities, processing place, route, never a key; a row carrying a key value, or a language-model participant without its model, is an error — and `assignable(role, participants, restrictions)` says who may hold a role. Agent M's own `docs/participants.md` parses without an error.

## Realises

- `PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE`
- `A PARTICIPANT HAS ONE OF FIVE TYPES`
- `A PARTICIPANT DECLARES ITS CAPABILITIES`
- `A PARTICIPANT DECLARES WHERE IT PROCESSES DATA`
- `A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL`
- `A PROCESS MODEL ORGANISES PEOPLE AND AGENTS`
- `A ROLE NAMES THE CAPABILITIES IT NEEDS`
- UC-017 — Configure the participants of the instance

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-process-model `parseParticipants`, `assignable`; ARC-019 decision 5.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-019.

## Modules

- MOD-process-model (kernel) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/process-model/participants.mjs` (new)
- `tests/test_participants.py`
- `tests/test_model_roles.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_model_roles.py` — `A PROCESS MODEL ORGANISES PEOPLE AND AGENTS`; `A ROLE NAMES THE CAPABILITIES IT NEEDS`
- `tests/test_participants.py` — `PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE`; `A PARTICIPANT HAS ONE OF FIVE TYPES`; `A PARTICIPANT DECLARES ITS CAPABILITIES`; `A PARTICIPANT DECLARES WHERE IT PROCESSES DATA`; `A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL`

## Acceptance criteria

From the SPEC's checks:

- `PARTICIPANTS ARE CONFIGURED ONCE PER INSTANCE` — `tests/test_participants.py`
- `A PARTICIPANT HAS ONE OF FIVE TYPES` — `tests/test_participants.py`
- `A PARTICIPANT DECLARES ITS CAPABILITIES` — `tests/test_participants.py`
- `A PARTICIPANT DECLARES WHERE IT PROCESSES DATA` — `tests/test_participants.py`
- `A PARTICIPANT BASED ON A LANGUAGE MODEL NAMES ITS MODEL` — `tests/test_participants.py` — a CLI-agent entry without a model is rejected; counter-proof: the same entry naming its model is accepted, and a person needs none.
- `A PROCESS MODEL ORGANISES PEOPLE AND AGENTS` — `tests/test_model_roles.py`
- `A ROLE NAMES THE CAPABILITIES IT NEEDS` — `tests/test_model_roles.py`

From the postcondition of UC-017 (Configure the participants of the instance), for the part this item builds:

> - The instance lists the participant with type, capabilities and processing place; no key is in the
>   repository.
> - Products can assign it to roles that need no more than its capabilities (UC-002).

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-027 — roles come from the model

## Needs a person

No.
