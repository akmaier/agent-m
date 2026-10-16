---
name: change-architecture
serves:
  - UC-023
  - UC-049
participant: one
needs:
  - draft text
resources: none
preconditions:
  - rests-on-accepted
recipes:
  - instruction
  - conversation
  - whole-spec
  - use-cases
  - whole-architecture
  - chapters-for-architecture
checks:
  - document-schema
  - graph-checks
  - identifier-kept
  - candidate-classes
person_decides:
  - A CONFLICT IS DECIDED BY A PERSON
reviewer: review-architecture
reviewers: 1
steps:
  - due-diligence
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

Changes the architecture as a person describes, seeing the whole project — the whole SPEC, every use case and the whole
architecture —: changes under the existing identifiers, and new decisions or modules only where something new is needed.
