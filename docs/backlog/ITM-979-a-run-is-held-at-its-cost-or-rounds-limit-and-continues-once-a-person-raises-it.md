---
id: ITM-979
title: A run is held at its cost or rounds limit, and continues once a person raises it
level: module
realises:
  - UC-043
  - A RUN HAS LIMITS FIXED AT ITS START
  - THE CORRECTION LOOP HAS A FIXED LIMIT
  - NO COST IS GUESSED
modules:
  - MOD-run-planner
builds_on:
  - ITM-977
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-043-4, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-979 A run is held at its cost or rounds limit, and continues once a person raises it

**REGISTER**

## Outcome

MOD-run-planner.md:100-104: `nextActions` "returns `hold` with the limit named when the cost reported so far reaches the cost
limit, or a job of the run stopped at the rounds limit with findings left: no further job starts, the running ones finish,
and the run waits for a person to raise the limit (`raiseLimits`) or stop it (UC-043 6c)." MOD-run-planner.md:117-122,
`raiseLimits(host, run, limits, context) -> Promise<{ commit }>`: appends `## Limits raised` through MOD-job-ledger's
`appendToRecord` and commits it on the head read; `NotRaised { limit }` for a limit not above the one in force,
`RecordEnded` for an ended run. Neither is built (`src/run-planner/index.mjs:3`, `src/run-planner/next.mjs:4`).

## Acceptance

- Unit tests that name MOD-run-planner: a run whose reported cost reaches its limit gets `hold` naming the cost and starts
  nothing; below the limit it continues; a job's cost that is unknown adds nothing; `raiseLimits` appends one part on the
  head read, after which `nextActions` starts again; a limit not above the current one throws `NotRaised` and writes nothing.
- Counter-proof: counting an unknown cost as zero toward the limit is caught by the test of a run with only unknown costs.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/run-planner/` and the tests that name MOD-run-planner change.
