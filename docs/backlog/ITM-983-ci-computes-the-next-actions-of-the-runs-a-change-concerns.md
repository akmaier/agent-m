---
id: ITM-983
title: CI computes the next actions of the runs a change concerns
level: module
realises:
  - UC-043
  - A RUN CONTINUES WITHOUT A CLICK BETWEEN ITS JOBS
modules:
  - MOD-workflow-entries
builds_on:
  - ITM-977
  - ITM-978
  - ITM-979
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-043-8, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-983 CI computes the next actions of the runs a change concerns

**REGISTER**

## Outcome

MOD-workflow-entries.md:235-239, `onRecordsChanged`: "and computes the next actions of every run the change concerns, from
the product's facts read once, taking those of this route and queueing those of other routes by their start records (`A RUN
CONTINUES WITHOUT A CLICK BETWEEN ITS JOBS`). Two entries that compute the same action are safe: only one taking lands."
`src/workflow-entries/product.mjs:3`: "The runs' next actions and onPullRequestClosed are other items'."

## Acceptance

- Unit tests that name MOD-workflow-entries, with a fixture product whose run waits for a merged job: one entry run takes the
  next action of the CI route and queues the action of a Bridge route by its start record; a second entry on the same head
  takes nothing twice.
- Counter-proof: an entry that ignores the run fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/workflow-entries/` and the tests that name MOD-workflow-entries change.
