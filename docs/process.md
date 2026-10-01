---
model: scrum-wip
model_file: docs/process-models/scrum-wip.md
model_version: a6c336801ae85c019ab4e4897fa608913121faac
sprint_close: scrum-master-session
---
# How Agent M is developed

**REGISTER**

The declaration of Agent M's process (UC-002, ARC-019 decision 4): the model by name and version — the commit of
this instance that holds its file —, the role assignment by participant name (`docs/participants.md`),
practices, branches, the Definition of Done and who closes a sprint. PO decisions of 2026-10-01.

## Model

`scrum-wip` — Scrum with a work-in-progress limit of 4 and no time box, adapted from the shipped Scrum model
(`docs/process-models/scrum-wip.md`; its source `docs/assets/process-models/scrum.md` is written by ITM-028).

## Roles

| Role | Participants |
|---|---|
| Product Owner | po-fable |
| Scrum Master | scrum-master-session |
| Developers | developer-opus-a, developer-opus-b, developer-opus-c, developer-opus-d |
| Release tester | tester-opus |

The Product Owner decides every gate of the model until Agent M is completely implemented. A gate's decision
recorded by the participant whose work the gate checks does not pass it (`A GATE IS NOT DECIDED BY THE
PARTICIPANT WHOSE WORK IT CHECKS`); release tests are written by tester-opus, never by the developer who
implemented the behaviour they test (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Practices

None.

## Branches

| Phase or time box | Branch | What is merged into it | Gate at its end |
|---|---|---|---|
| Sprint | `sprint/<nn>` | each team's branch, through a pull request with green CI | the merge of `sprint/<nn>` into `main`, through a pull request with green CI, decided by the Product Owner once the sprint's review and retrospective are recorded |

Every team works on a branch of its own, one backlog item per branch (`AGILE IMPLEMENTATION STARTS FROM THE
BACKLOG`, `A PHASE OR A TIME BOX MAY HAVE A BRANCH OF ITS OWN`).

## Sprint

- The Product Owner selects the sprint's items from the ordered backlog (`docs/backlog/order.md`); teams work
  only on selected items, at most four in progress at once.
- An item is in progress from the moment its team starts it until its pull request is merged into the sprint
  branch; an item waiting for review counts.
- A sprint has no fixed length. It ends when every selected item is done or the Product Owner ends it; then the
  review of its increment and the retrospective are recorded, and then the Product Owner decides the merge of
  `sprint/<nn>` into `main`.
- Closing a sprint — its review, its retrospective and the decisions on its unfinished items — is assigned to
  scrum-master-session (`CLOSING A SPRINT CAN BE ASSIGNED TO A PARTICIPANT`), not to po-fable: the merge of
  `sprint/<nn>` into `main` checks the review and the retrospective, and the Product Owner who decides it must
  not have written them (`A GATE IS NOT DECIDED BY THE PARTICIPANT WHOSE WORK IT CHECKS`). A change to this
  declaration, to the model or to a participant's instructions that a retrospective recommends is proposed,
  never applied by the agent (`AN AGENT'S RETROSPECTIVE CHANGES NO PROCESS BY ITSELF`).

## Definition of Done

The default — the job rules (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`): a pull request is done when
its CI run is green; the job's first commit held only failing tests — or, for a refactoring job, CI was green on
every commit and no expected result changed —; it changes only the job's modules; and every gate the workflow
places before the merge is recorded. No condition is added.

## Boundary

Until Agent M's own features carry them, SPEC changes and the acceptance of use cases, architecture decisions
and modules stay with the person `akmaier`: a SPEC change is agreed with `akmaier` and accepted by an approval
record committed under that account, and so is every use case, decision and module
(`ACCEPTANCE IS A COMMIT BY THE ACCEPTING PERSON`, `A SPECIFICATION CHANGE IS APPROVED BEFORE IT IS WRITTEN`).
No other participant — the Product Owner po-fable included — changes SPEC.md, a use case or an architecture
file, or accepts one; a gap found during a sprint becomes a change request to `akmaier`, and the item waits.
