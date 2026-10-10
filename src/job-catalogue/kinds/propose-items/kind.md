---
name: propose-items
serves:
  - UC-032
participant: one
needs:
  - draft text
resources: none
preconditions:
  - rests-on-accepted
recipes:
  - backlog-inputs
checks:
  - backlog-checks
  - candidate-classes
person_decides:
steps:
gate_points:
review: person
writer: backlog-items
limit: 5
---
## Purpose

Drafts backlog items for the accepted requirements and use cases no item realises yet, bottom up along the architecture,
each naming what it realises, the modules it changes and the items it builds on.
