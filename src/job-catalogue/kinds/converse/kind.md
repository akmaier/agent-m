---
name: converse
serves:
  - UC-049
participant: one
needs:
  - draft text
resources: none
preconditions:
recipes:
  - page
  - conversation
  - instruction
  - chapters-for-page?
checks:
  - document-schema
  - graph-checks
person_decides:
steps:
gate_points:
review: person
writer: return-draft
limit: 5
tools:
  - list-files
  - read-file
  - search-files
  - propose-edit
  - hand-over
tool_limit: 30
---
## Purpose

Answers a person's message about the page they are looking at, in the conversation so far: the answer, and the edits the
participant proposes to documents below `docs/`, which a person may save.
