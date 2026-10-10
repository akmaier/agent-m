---
name: close-sprint
serves:
  - UC-041
participant: one
needs:
  - draft text
  - read the repository
  - write to the repository
resources: none
preconditions:
recipes:
  - sprint-facts
checks:
  - sprint-record-checks
person_decides:
steps:
gate_points:
review: none
writer: sprint-record
limit: 5
---
## Purpose

Closes a sprint for the closer it is assigned to: the review of the increment with the sources of its feedback, where
each unfinished item goes, and the retrospective, whose changes stay proposals.
