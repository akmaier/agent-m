---
name: analyse-issue
serves:
  - UC-012
participant: one
needs:
  - draft text
resources: none
preconditions:
recipes:
  - issue-context
checks:
person_decides:
steps:
gate_points:
review: none
writer: return-draft
limit: 5
---
## Purpose

Analyses an issue against the requirements, use cases and tests it touches, and proposes its class with its reasoning,
for the person to confirm.
