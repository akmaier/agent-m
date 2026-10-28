---
id: ITM-978
title: A run's next actions — the tests of its selection, then finish
level: module
realises:
  - UC-043
  - A RUN EXECUTES THE PROCESS MODEL OVER A SELECTION
  - RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER
modules:
  - MOD-run-planner
builds_on:
  - ITM-977
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-043-3, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-978 A run's next actions — the tests of its selection, then finish

**REGISTER**

## Outcome

MOD-run-planner.md:97-100: "once the selected plan steps are implemented, start `propose-tests` for them at every level the
product's schedule names — its rows but `paid` (`facts.schedule`) —, and when that job has ended, `write-tests` with the
cases its record's `## End` holds under `draft:` — no person attends a run —, the selection and the levels, the release
level on a participant other than the implementer (a backlog item's job includes its tests); then `finish`."
MOD-participant-list's `differs` gives the other participant (MOD-run-planner.md:24, :157).

## Acceptance

- Unit tests that name MOD-run-planner: after the last implementation job of a plan selection, `propose-tests` starts with
  the schedule's levels without `paid`; after it ends, `write-tests` starts with its `draft:` cases, the release level on a
  participant other than the implementer; after that, `finish`. A backlog selection goes to `finish` without a test job.
- Counter-proof: giving the release level to the implementer fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/run-planner/` and the tests that name MOD-run-planner change.
