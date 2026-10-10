---
name: rewrite-without-persons
serves:
  - UC-038
participant: one
needs:
  - draft text
resources: none
preconditions:
recipes:
  - report-data
checks:
  - people-search
person_decides:
reviewer: check-for-persons
reviewers: 3
steps:
gate_points:
review: none
writer: return-draft
limit: 5
---
## Purpose

Rewrites the report data a person picked from a mail without any person, keeping its technical content; three other
participants check the result.
