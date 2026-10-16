---
id: ITM-535
title: A job's live state, its log and its cancel
level: module
realises:
  - UC-049
  - ONE DASHBOARD SHOWS EVERY JOB
  - A CANCELLED JOB WRITES NOTHING MORE
modules:
  - MOD-runtimes
builds_on:
  - ITM-495
tests:
  - unit
origin:
  - MOD-runtimes, Interfaces: liveState, jobLog, cancelJob
  - sprint team1/43's start decision: ITM-505 follows a handed-over job by them, and none is built (`src/runtimes/index.mjs`)
---
# ITM-535 A job's live state, its log and its cancel

**REGISTER**

## Outcome

MOD-runtimes' `liveState`, `jobLog` and `cancelJob`, as its file states them:
- the live state of a job from its record and its route, by asking the CI service or the Bridge;
- the job's log as it grows;
- the cancel of a running job, which appends the end `cancelled`.
None of them is built (`src/runtimes/index.mjs`: "resumeJob, liveState, jobLog, cancelJob, retryJob … are not part of"
it). ITM-505, which follows a handed-over job until it ends, builds on them.

## Acceptance

- Against a fixture host and a fixture Bridge, each route gives the live state its record and the route report. The log
  is given as it grows, and the cancel ends the job with the end `cancelled`, after which nothing more is written.
- The first commit holds only the tests, and CI is red on it, the stub run recorded where only a missing export makes it
  red.
- Each test states its expected values in its own text.
