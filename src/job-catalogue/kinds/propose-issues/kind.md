---
name: propose-issues
serves:
  - UC-038
participant: one
needs:
  - draft text
resources: none
preconditions:
recipes:
  - mail-batch
checks:
  - people-search
person_decides:
steps:
gate_points:
review: none
writer: return-draft
limit: 5
---
## Purpose

Proposes, for each mail, the product it concerns, its kind, a neutral issue without any person, and the open issues it
may duplicate, for the person to decide on.
