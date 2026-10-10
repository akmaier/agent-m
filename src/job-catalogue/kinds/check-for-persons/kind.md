---
name: check-for-persons
serves:
  - UC-038
participant: one
needs:
  - draft text
resources: none
preconditions:
recipes:
  - draft
checks:
person_decides:
steps:
gate_points:
review: none
writer: return-draft
limit: 5
---
## Purpose

Checks a rewritten text for any mention of a person, each mention a finding.
