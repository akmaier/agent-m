---
model: scrum-wip
model_file: docs/process-models/scrum-wip.md
model_version: a6c336801ae85c019ab4e4897fa608913121faac
sprint_close: scrum-master-session
---

# How Agent M is developed

**REGISTER**

The declaration of Agent M's process (UC-002, ARC-019): the model by name and version — the commit of this instance that
holds its file —, the role assignment by participant name (`docs/participants.md`), practices, branches, the
Definition of Done and who closes a sprint.

## Roles

| Role | Participants |
|---|---|
| Product Owner | po-opus |
| Scrum Master | scrum-master-session |
| Developers | developer-opus-a, developer-opus-b, developer-opus-c, developer-opus-d |
| Release tester | tester-opus |

## Practices

- none

## Branches

| Phase or time box | Branch |
|---|---|
| Sprint | `sprint/<nn>` |

## Definition of Done

The job rules hold for every pull request; no condition is added.

## Model

`scrum-wip` — Scrum with a work-in-progress limit of 4 and no time box, adapted from the shipped Scrum model.

## Sprint

- Every team works on a branch of its own, one backlog item per branch, and merges it into `sprint/<nn>` through a
  pull request with green CI.
- The Product Owner selects the sprint's items from the ordered backlog (`docs/backlog/order.md`); teams work
  only on selected items, at most four in progress at once.
- An item is in progress from the moment its team starts it until its pull request is merged into the sprint
  branch; an item waiting for review counts.
- A sprint has no fixed length. It ends when every selected item is done or the Product Owner ends it; then the
  review of its increment and the retrospective are recorded, and then the Product Owner decides the merge of
  `sprint/<nn>` into `main`.
- Closing a sprint — its review, its retrospective and the decisions on its unfinished items — is assigned to
  scrum-master-session (`CLOSING A SPRINT CAN BE ASSIGNED TO A PARTICIPANT`), not to po-opus: the merge of
  `sprint/<nn>` into `main` checks the review and the retrospective, and the Product Owner who decides it must
  not have written them (`A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS`). A change to this
  declaration, to the model or to a participant's instructions that a retrospective recommends is proposed,
  never applied by the agent (`AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF`).

## Boundary

Until Agent M's own features carry them, SPEC changes and the acceptance of use cases, architecture decisions
and modules stay with the person `akmaier`: a SPEC change is agreed with `akmaier` and accepted by an approval
record committed under that account, and so is every use case, decision and module
(`ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON`, `A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN`).
No other participant — the Product Owner po-opus included — changes SPEC.md, a use case or an architecture
file, or accepts one; a gap found during a sprint becomes a change request to `akmaier`, and the item waits.
