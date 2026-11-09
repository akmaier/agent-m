---
name: change-requirements
serves:
  - UC-019
  - UC-012
  - UC-049
participant: one
needs:
  - draft text
resources: none
preconditions:
  - person-source
recipes:
  - instruction
  - conversation
  - draft?
  - issue-context?
  - named-requirements
  - requirement-hierarchy
  - chapters-for-requirements
checks:
  - requirement-form
person_decides:
steps:
gate_points:
review: person
writer: spec-edits
limit: 5
tools:
  - list-files
  - read-file
  - search-files
  - hand-over
tool_limit: 30
---
## Purpose

Changes the requirements a person names by their instruction and returns the new text of what it changes, as a person writes it in the editor: each SPEC section, each open entry's proposal, and `docs/groups/requirements.md`, with why. A job takes the parameter `source`: the account `<server>/<account>` of the
person who starts it, which every requirement it adds or changes names among its sources. A job started from an issue takes the parameter `issue`, that issue's number: its recipe `issue-context?` gives the issue with what it touches, and the queue it writes names the issue as its origin.
