---
id: ITM-976
title: A run is read from its record
level: module
realises:
  - UC-043
  - A RUN IS A JOB THAT NAMES ITS JOBS
  - A RUN HAS LIMITS FIXED AT ITS START
modules:
  - MOD-run-planner
builds_on:
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-043-1, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-976 A run is read from its record

**REGISTER**

## Outcome

MOD-run-planner.md:82-88: `Run` — "`{ id, selection, limits: { jobsAtOnce, cost, rounds }, jobs, state: "running" | "waiting
at a gate" | "held by a limit" | "finished" | "stopped" }`; `limits` are those in force", and "`runOf(record: JobRecord,
jobs: JobRow[]) -> Run` — a run from its record and the rows of its jobs, with the limits of its newest `## Limits raised`
part, or of its parameters. Errors: `NotARun` for a record of another kind." Not built: `src/run-planner/index.mjs:2`.
MOD-job-ledger already reads a run's parts (`src/job-ledger/index.mjs:347-351`).

## Acceptance

- Unit tests that name MOD-run-planner: a fixture run record with two `## Job started` parts and a `## Limits raised` part
  gives its selection, its jobs and the raised limits; without the raise, the limits of `## Parameters`; a record of
  another kind throws `NotARun`.
- Counter-proof: reading the oldest raise instead of the newest fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/run-planner/` and the tests that name MOD-run-planner change.
