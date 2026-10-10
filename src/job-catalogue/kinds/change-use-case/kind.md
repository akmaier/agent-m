---
name: change-use-case
serves:
  - UC-019
participant: one
needs:
  - draft text
resources: none
preconditions:
recipes:
  - instruction
  - use-case-with-neighbours
  - chapters-for-requirements
checks:
  - document-schema
  - graph-checks
  - identifier-kept
person_decides:
steps:
gate_points:
review: person
writer: open-files
limit: 5
---
## Purpose

Changes one use case as a person's instruction says, seeing every requirement it realises and every other use case of
the product; the use case keeps its identifier.
