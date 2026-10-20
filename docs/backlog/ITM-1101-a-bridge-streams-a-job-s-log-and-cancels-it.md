---
id: ITM-1101
title: A Bridge streams a job's log and cancels it (GET /v1/jobs/{id}/log, POST /v1/jobs/{id}/cancel)
level: module
realises:
  - UC-036
  - A CANCELLED JOB WRITES NOTHING MORE
modules:
  - MOD-bridge-jobs
builds_on:
  - ITM-1097
tests:
  - unit
origin:
  - the gate of #1123 (ITM-1097), sprint team2/97, on main at 747cd6d0
---
# ITM-1101 A Bridge streams a job's log and cancels it (GET /v1/jobs/{id}/log, POST /v1/jobs/{id}/cancel)

**REGISTER**

## Outcome

MOD-bridge-jobs.md:100-102: `jobHandlers` answers "`GET /v1/jobs/{id}/log` — … their logs as they grow" and "`POST
/v1/jobs/{id}/cancel` — stops the agent's process and confirms once it has ended; the job then commits nothing more
(`A CANCELLED JOB WRITES NOTHING MORE`)". ITM-1097 built `GET /v1/jobs`. These two are not built, as #1123 names.
MOD-bridge-client's `bridgeJobLog` and `cancelOnBridge` send requests that nothing answers.

## Acceptance

- Unit tests naming MOD-bridge-jobs, over a running fixture job:
  - `GET /v1/jobs/{id}/log?from={line}` gives the lines from `line` on, in the form `bridgeJobLog` reads, and says when the
    job has ended;
  - `POST /v1/jobs/{id}/cancel` stops the agent's process and answers once it has ended, after which the job commits
    nothing;
  - an unknown job is answered by its error.
- Counter-proof: a cancel that answers before the process ended fails the test.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/bridge-jobs/` and the tests that name MOD-bridge-jobs change.
