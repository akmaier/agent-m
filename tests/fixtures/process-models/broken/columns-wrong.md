---
name: fixture-pulled
kind: pulled
adapted_from: fixture-base
measure: items per state over time
---
# A pulled model — fixture

A complete model definition in the format of ARC-019 decision 1, for tests/test_model_validation.py and
tests/test_gate_definition.py. Work is pulled from a backlog under a work-in-progress limit; one gate is decided by a
role of the model, one by a named CI check. The copies under broken/ each break one rule.

## Phases

| Name | Role | Produces |
|---|---|---|
| Planning | Owner | ITM (the selection of backlog items) |
| Building | Builders | MOD (code of the item's modules), TST |
| Checking | Checker | TST (release tests of the selected items) |
| Closing | Owner | a record of the cycle |

## Transitions

| From | To | Kind |
|---|---|---|
| Planning | Building | sequence |
| Building | Checking | sequence |
| Checking | Building | back |
| Checking | Closing | sequence |
| Closing | Planning | sequence |

## Verification pairs

| Phase | Verified by |
|---|---|
| Building | Checking |
| Planning | Closing |

## Gates

| Between | Artifacts | Condition | Decider |
|---|---|---|---|
| Building → Checking | the item's pull request, with its code and TST | CI is green on it | Owner |
| Checking → Closing | the release tests (TST) of the selected items | green on the branch | CI check `release-tests` |

## Roles

| Name | Filled by | Capabilities |
|---|---|---|
| Owner | person | read the repository, write to the repository |
| Builders | agent | read the repository, write to the repository, run code and tests, use tools |
| Checker | either | read the repository, run code and tests |

## Flow control

| Kind | Value |
|---|---|
| WIP limit | 3 |
| Time box | none |
| Sprints | yes |

Prose below a table belongs to no row.
