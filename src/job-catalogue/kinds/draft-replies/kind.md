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
the replies are stored as drafts and never sent. With the parameter `question` — the person's point to ask — it drafts
instead one question to the reporter of the one listed mail of an open issue (UC-039 1a), stored as a draft and never sent.
