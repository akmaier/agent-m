---
name: change-requirements
serves:
  - UC-019
  - UC-012
participant: one
needs:
  - draft text
resources: none
preconditions:
recipes:
  - instruction
  - named-requirements
  - spec-with-queues
  - chapters-for-requirements
checks:
  - requirement-form
  - candidate-classes
person_decides:
  - A CONFLICT IS DECIDED BY A PERSON
steps:
gate_points:
review: person
writer: queue-entries
limit: 5
---
## Purpose

Changes the requirements a person names by their instruction, against every requirement of the product, each resulting
requirement classed as new, a change, a duplicate or a conflict, under the same rules as a derivation. A job takes the parameter `source`: the own source of the person who starts it,
which every requirement it returns names among its sources.
