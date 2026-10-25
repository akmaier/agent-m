---
name: fixture-pulled
kind: pulled
adapted_from: fixture-base
---
# A pulled model — fixture

A complete model definition of MOD-model-catalogue's schema (src/model-catalogue/model.schema.md), for
tests/test_model_validation.py and tests/test_gate_definition.py. Work is pulled from a backlog under a work-in-progress limit; one gate is decided by a
role of the model, one by a named CI check. The copies under broken/ each break one rule.

## Phases

| Name | Role | Produces |
|---|---|---|
| Planning | Owner | ITM (the selection of backlog items) |
| Building | Builders | MOD (code of the item's modules), TST |
| Checking | Checker | TST (release tests of the selected items) |
| Closing | Owner | sprint record (the record of the cycle) |

## Transitions

| From | To | Kind |
|---|---|---|
| Planning | Building | sequence |
| Building | Checking | sequence |
| Checking | Building | back |
| Checking | Closing | sequence |
| Closing | Planning | sequence |

## Verification pairs

| Phase | Checked by |
|---|---|
| Building | Checking |
| Planning | Closing |

## Gates

| Between | Artifacts | Condition | Decider |
|---|---|---|---|
| Building → Checking | the item's pull request, with its code and TST | CI is green on it | Owner |
| Checking → Closing | the release tests (TST) of the selected items | green on the branch | check: release-tests |

## Roles

| Name | Filled by | How many | Capabilities |
|---|---|---|---|
| Owner | person | one | read the repository, write to the repository |
| Builders | agent | several | read the repository, write to the repository, run code and tests, use tools |
| Checker | either | several | read the repository, run code and tests |

## Flow control

| Kind | Value |
|---|---|
| WIP limit | 3 |
| Time box | none |
| Sprints | yes |

Prose below a table belongs to no row.
