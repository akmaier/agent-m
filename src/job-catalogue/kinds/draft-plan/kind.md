---
name: draft-plan
serves:
  - UC-045
participant: one
needs:
  - draft text
resources: none
preconditions:
  - rests-on-accepted
recipes:
  - architecture-and-model
checks:
  - plan-checks
person_decides:
steps:
gate_points:
review: person
writer: plan-steps
limit: 5
---
## Purpose

Drafts the implementation plan from the accepted architecture, bottom up: a step per module, a module after every module
whose interface it uses, then a subsystem's integration, then the system.
