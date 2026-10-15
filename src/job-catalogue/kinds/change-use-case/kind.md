---
name: change-use-case
serves:
  - UC-019
  - UC-049
participant: one
needs:
  - draft text
resources: none
preconditions:
recipes:
  - instruction
  - conversation
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
tools:
  - list-files
  - read-file
  - search-files
  - hand-over
tool_limit: 30
---
## Purpose

Changes one use case as a person's instruction says, seeing every requirement it realises and every other use case of
the product; the use case keeps its identifier.
