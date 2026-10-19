---
id: ITM-970
title: The list of every job is grouped by state, waiting at a gate first
level: module
realises:
  - UC-036
  - ONE DASHBOARD SHOWS EVERY JOB
modules:
  - MOD-main-page
builds_on:
  - ITM-509
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-036-1, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-970 The list of every job is grouped by state, waiting at a gate first

**REGISTER**

## Outcome

UC-036:77-78: "Agent M shows one list across products, newest first, grouped by state. *Waiting at a gate* comes
first." MOD-main-page.md:92-93 states the route `jobs` with "waiting at a gate first". The list today is newest first
with the waiting rows on top (`src/main-page/jobs.mjs:80-96`, TST-509001), not grouped by state. The reading taken: the
groups are the job states of MOD-job-ledger in one order, waiting at a gate first, newest first within each group; the
module text does not forbid it.

## Acceptance

- Over the fixture of TST-509001, the rows stand in one group per state, *waiting at a gate* first, newest first within
  each, with the state named above each group; the filters still narrow every group. Counter-proof: two states
  interleaved fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/main-page/` and the tests that name MOD-main-page change.
