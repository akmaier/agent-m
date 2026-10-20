---
id: ITM-1097
title: A Bridge lists the jobs it runs, with their live states (GET /v1/jobs)
level: module
realises:
  - UC-044
  - UC-036
modules:
  - MOD-bridge-jobs
builds_on:
tests:
  - unit
origin:
  - ITM-1055's stop (developer-sonnet-i, sprint team2/97), on main at 3095be67
---
# ITM-1097 A Bridge lists the jobs it runs, with their live states (GET /v1/jobs)

**REGISTER**

## Outcome

MOD-bridge-jobs.md:100: `jobHandlers` answers "`GET /v1/jobs`, `GET /v1/jobs/{id}/log` — the jobs it runs with their live states,
and their logs as they grow". `src/bridge-jobs/handlers.mjs` has only `POST /v1/jobs` (:55), and the running jobs are
private to `watch.mjs` (:53). So MOD-desktop-shell's *Quit*, which names the jobs still running (MOD-desktop-shell.md:179-181,
ITM-1055), has nothing to ask. MOD-bridge-client's `bridgeJobs` (`src/bridge-client/index.mjs:159`) sends the request that
nothing answers.

## Acceptance

- Unit tests naming MOD-bridge-jobs: with one job running and one ended, `GET /v1/jobs` answers both with their live states.
  The answer has the form MOD-bridge-client's `bridgeJobs` reads. With none, it answers an empty list.
- Counter-proof: a running job left out of the answer fails the test.
- `GET /v1/jobs/{id}/log` and `POST /v1/jobs/{id}/cancel` are the same text's. If they are not built either, the pull request
  names it, and they are registered as an item of their own.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/bridge-jobs/` and the tests that name MOD-bridge-jobs change.
