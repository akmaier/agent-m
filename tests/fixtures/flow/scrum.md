---
name: fixture-scrum
kind: pulled
adapted_from: fixture-base
measure: remaining items per time box
---
# A Scrum model with a time box — fixture

A complete model definition in the format of ARC-019 decision 1, for the tests of MOD-work-items' sprints, item states
and work-in-progress limit (tests/test_wip_limit.py, tests/test_time_box_selection.py, tests/test_job_from_backlog.py).
Only its front matter and its flow control matter to them; the tables are those of a valid pulled model.

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

| Phase | Checked by |
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
| WIP limit | none |
| Time box | 2 weeks |
| Sprints | yes |
