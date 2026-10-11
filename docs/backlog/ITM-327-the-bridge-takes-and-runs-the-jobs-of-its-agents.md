---
id: ITM-327
title: The Bridge takes and runs the jobs of its agents
level: module
realises:
  - UC-011
  - A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
  - A LOCAL AGENT USES THE PERSON'S OWN LOGIN
  - A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN
  - ONE DEFINITION, THREE DRIVERS
  - A RUNTIME IS INTERCHANGEABLE
modules:
  - MOD-bridge-jobs
builds_on:
  - ITM-312
  - ITM-323
  - ITM-321
  - ITM-317
  - ITM-326
  - ITM-391
tests:
  - unit
origin:
  - UC-011 steps 2 to 5
---
# ITM-327 The Bridge takes and runs the jobs of its agents

**REGISTER**

## Outcome

MOD-bridge-jobs' `POST /v1/jobs`, `startWatching` and `stopWatching`, as its file states them, in `watch.mjs` and
`workfolders.mjs`. `startWatching` takes the Bridge's name, the agents it offers with their working folders, the served
products and the interval. In the working folder of each offered agent the Bridge keeps a clone of the instance, one
clone per served product, read with the computer's own git login (ITM-312), and one working clone per running job. At
the given interval, and at once after a hand-over, each queued job whose participant's route names this Bridge and an
agent it offers is taken (ITM-317) — a commit only on the head read — and run from its start record alone: the working
clone holds the product's branch and the instance's clone the commit `agent_m` the record names, which the job's context
names as `instance.checkout` (ITM-391); prepared by the job runner and driven by `agentDriver` without a key (ITM-321),
unattended: its kind's writer writes at once, open, and a draft handed back stands in the end record; the end is
appended with its results and the working clone removed. `POST /v1/jobs` answers `invalid-request` for an agent the
Bridge does not offer or whose working folder is not set. A product that cannot be read is skipped with its reason.
`stopWatching("pause")` takes nothing new; `"quit"` ends the running jobs as cancelled, naming the quit. Resuming after
a gate, a kind that names gate points, advancing runs, an agent's sprint close, and the job list, log and cancel routes
are not part of this item.

## Acceptance

- Unit tests that name MOD-bridge-jobs state, before the code exists, with a bare repository as a served product and as
  the instance, a fixture agent executable offered with a temporary working folder and the strategies a fixture
  registers: a queued job of this Bridge taken, run in that folder with the instance at the record's commit, and ended
  with its results, the writer's commit on the origin; a job of another Bridge, route or of an agent not offered left
  alone; a hand-over for an agent without a folder refused; a job two watchers see taken once; a handed-over job run
  before the interval ends; an unreadable product skipped with its reason and read at the next interval; after pause
  nothing new taken; quit ending a running job as cancelled with nothing written after.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/bridge-jobs/` and the tests that name MOD-bridge-jobs change.
