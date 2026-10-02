---
id: ITM-030
title: A product's declaration and its workflow — model, roles, practices, branches, process requirements
kind: implementation
level: 1
realises:
  - THE PROCESS MODEL IS DECLARED PER PRODUCT
  - THE MODEL DETERMINES THE PHASES AND THE GATES
  - A PROCESS REQUIREMENT ADDS TO THE MODEL
  - A PRACTICE IS NOT A MODEL
  - A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN
  - WORK MERGES INTO THE DEFAULT BRANCH UNLESS A BRANCH IS SET
  - UC-002
modules:
  - MOD-process-model
depends_on:
  - ITM-028
  - ITM-029
origin: backlog refinement 2026-10-01
---
# ITM-030 A product's declaration and its workflow — model, roles, practices, branches, process requirements

**REGISTER**

## Outcome

`parseDeclaration(text)` reads a product's `docs/process.md` (ARC-019 decision 4) and `deriveWorkflow(model, practices, processRequirements)` gives phases, transitions, gates with deciders and branches; process requirements add gates and artifacts, marked with requirement and source; a practice adds and never replaces. Agent M's own `docs/process.md` parses, and its sprint branch `sprint/<nn>` is the branch of the model's sprint.

## Realises

- `THE PROCESS MODEL IS DECLARED PER PRODUCT`
- `THE MODEL DETERMINES THE PHASES AND THE GATES`
- `A PROCESS REQUIREMENT ADDS TO THE MODEL`
- `A PRACTICE IS NOT A MODEL`
- `A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN`
- `WORK MERGES INTO THE DEFAULT BRANCH UNLESS A BRANCH IS SET`
- UC-002 — Choose how the product is developed

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-process-model `parseDeclaration`, `deriveWorkflow`; ARC-019 decisions 3, 4.

Architecture decisions its modules follow: ARC-003, ARC-006, ARC-019.

## Modules

- MOD-process-model (kernel) — uses no other module

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/process-model/workflow.mjs` (new)
- `tests/test_model_declared.py`
- `tests/test_workflow_from_model.py`
- `tests/test_process_requirement_is_additive.py`
- `tests/test_phase_branch.py`

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **1** — browser and hosted CI; nothing installed.

## Tests the SPEC names

- `tests/test_model_declared.py` — `THE PROCESS MODEL IS DECLARED PER PRODUCT`; `A PRACTICE IS NOT A MODEL`
- `tests/test_phase_branch.py` — `A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN`; `WORK MERGES INTO THE DEFAULT BRANCH UNLESS A BRANCH IS SET`
- `tests/test_process_requirement_is_additive.py` — `A PROCESS REQUIREMENT ADDS TO THE MODEL`
- `tests/test_workflow_from_model.py` — `THE MODEL DETERMINES THE PHASES AND THE GATES`

## Acceptance criteria

From the SPEC's checks:

- `THE PROCESS MODEL IS DECLARED PER PRODUCT` — `tests/test_model_declared.py`
- `THE MODEL DETERMINES THE PHASES AND THE GATES` — `tests/test_workflow_from_model.py` — each of the five catalogue models, the reuse-oriented one included, yields its workflow.
- `A PROCESS REQUIREMENT ADDS TO THE MODEL` — `tests/test_process_requirement_is_additive.py`
- `A PRACTICE IS NOT A MODEL` — `tests/test_model_declared.py`
- `A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN` — `tests/test_phase_branch.py`
- `WORK MERGES INTO THE DEFAULT BRANCH UNLESS A BRANCH IS SET` — `tests/test_phase_branch.py`

From the postcondition of UC-002 (Choose how the product is developed), for the part this item builds:

> - The product declares exactly one process model, its role assignment, its Definition of Done, and
>   zero or more practices.
> - The workflow Agent M offers for the product follows from the model, the practices and the
>   product's process requirements — and from nothing else.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-028 — each catalogue model yields its workflow
- ITM-029 — role assignment by participant name

## Needs a person

No.
