---
name: scrum-wip
kind: pulled
adapted_from: scrum
measure: items per state over time
---

# Scrum with a work-in-progress limit

**REGISTER**

A process model of this instance (UC-031), adapted from the shipped Scrum model: the flow is controlled by a
work-in-progress limit of 4 instead of a time box; sprints keep a selection the Product Owner makes and have no fixed
length; release tests are written by Developers who implemented none of the behaviour they test.

An item counts as in progress from the moment its team starts it until its pull request is merged into the sprint
branch; an item waiting for review counts. A sprint works on the selection the Product Owner made at Sprint planning.
It ends when every selected item is done or the Product Owner ends it; then the review of its increment and the
retrospective are recorded, and then the Product Owner decides the merge of the sprint branch into `main`.

## Phases

| Name | Role | Produces |
|---|---|---|
| Sprint planning | Product Owner | ITM (the sprint's selection of backlog items) |
| Development | Developers | MOD (code of the item's modules), TST |
| Release testing | Developers | TST (release tests of the selected items) |
| Sprint review | Product Owner | sprint record (the review of the increment) |
| Retrospective | Product Owner | sprint record (the retrospective) |

## Transitions

| From | To | Kind |
|---|---|---|
| Sprint planning | Development | sequence |
| Development | Release testing | sequence |
| Release testing | Development | back |
| Release testing | Sprint review | sequence |
| Sprint review | Retrospective | sequence |
| Retrospective | Sprint planning | sequence |

## Verification pairs

| Phase | Checked by |
|---|---|
| Development | Release testing |
| Sprint planning | Sprint review |

## Gates

| Between | Artifacts | Condition | Decider |
|---|---|---|---|
| Development → Release testing | the item's pull request into the sprint branch, with its code and TST | CI is green on it and the Definition of Done holds | Product Owner |
| Release testing → Sprint review | the release tests (TST) of the selected items | written by a participant other than the implementer of the behaviour they test, green on the sprint branch | Product Owner |
| Retrospective → Sprint planning | the pull request of the sprint branch into `main`; the sprint record | the review and the retrospective are recorded, CI is green on the pull request | Product Owner |

## Roles

| Name | Filled by | Capabilities |
|---|---|---|
| Product Owner | either | read the repository, write to the repository |
| Scrum Master | either | read the repository |
| Developers | either | read the repository, write to the repository, run code and tests, use tools |

## Flow control

| Kind | Value |
|---|---|
| WIP limit | 4 |
| Time box | none |
| Sprints | yes |
