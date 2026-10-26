---
id: ITM-1214
title: The generated CI splits rows into shards, bounds its jobs, and keeps the token from test jobs
level: module
realises:
  - THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE
  - A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
  - A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
  - A JOB RECORD STARTS NO CI RUN
  - COMMIT TESTS CALL NO PAID SERVICE
  - UC-027
modules:
  - MOD-test-schedule
builds_on:
  - ITM-744
  - ITM-1213
tests:
  - unit
origin:
  - ITM-476, split after akmaier accepted MOD-test-schedule on 2026-10-26 (33f3ab1b)
---
# ITM-1214 The generated CI splits rows into shards, bounds its jobs, and keeps the token from test jobs

**REGISTER**

## Outcome

`ciConfiguration` and its templates generate the configuration MOD-test-schedule.md describes under *The generated
configuration*, on GitHub and GitLab:

- one test job per row and occasion, run as the row's `shards` parallel jobs (a matrix; `parallel:`), each setting the
  variables of *The variables of a test job*, restoring the cache, running `setup`, then `runTests`, and keeping its
  report and status as an artifact under the names of *The reports of a run*; no test job reads a token;
- `minutes` as the time limit of every job on every commit and pull request;
- `agent-m setup` where `cache` names paths, keyed by `setup` and the week;
- `agent-m records` after every test job, whatever their outcome, running `onTestsFinished`;
- `agent-m done` on a pull request after the test jobs and `agent-m records`, with `AGENT_M_EXPECTED`;
- the token only in `agent-m records` and `agent-m done` (GitHub: the secret `AGENT_M_TOKEN`; GitLab: the environment
  `agent-m-write` with the action `verify`, taking neither `default:` nor global `variables:`).

`configurationDrift` compares against the new bytes.

## Acceptance

- Unit tests naming MOD-test-schedule over fixture schedules, for GitHub and GitLab: shards give a matrix or `parallel:`
  of that size; every job of a commit or pull request carries `minutes`; the setup job appears only with `cache`; the
  token appears in the records and done jobs alone (counter-proof: a test job naming it fails the test); `agent-m done`
  needs the test jobs and `agent-m records` and runs whatever their outcome; a push touching only `docs/jobs/` starts
  nothing.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-schedule/` and the tests that name MOD-test-schedule change.
