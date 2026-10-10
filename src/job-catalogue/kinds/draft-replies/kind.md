---
name: draft-replies
serves:
  - UC-039
participant: one
needs:
  - draft text
resources: none
preconditions:
recipes:
  - reply-inputs
checks:
person_decides:
steps:
gate_points:
review: none
writer: mail-drafts
limit: 5
---
## Purpose

Drafts one reply per mail of a closed issue: what the problem was, what was done, from which version the fix is live;
the replies are stored as drafts and never sent.
