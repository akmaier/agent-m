---
name: decide-gate
serves:
  - UC-034
  - UC-036
participant: one
needs:
  - read the repository
resources: none
preconditions:
recipes:
  - gate-inputs
checks:
person_decides:
steps:
gate_points:
review: none
writer: gate-record
limit: 5
---
## Purpose

Decides a gate of the product's workflow for the agent that holds its deciding role: whether the artifacts it checks
meet its condition, with the reasoning.
