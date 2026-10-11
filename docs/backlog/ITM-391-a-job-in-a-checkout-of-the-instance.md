---
id: ITM-391
title: A job in a checkout of the instance
level: module
realises:
  - UC-010
  - UC-011
  - A JOB IN A CHECKOUT OF THE INSTANCE READS THE CHAPTERS THERE
  - A RUNTIME IS INTERCHANGEABLE
modules:
  - MOD-job-runner
builds_on:
tests:
  - unit
origin:
  - UC-011 step 3
  - UC-010 step 3
---
# ITM-391 A job in a checkout of the instance

**REGISTER**

## Outcome

MOD-job-runner's `JobContext`, as its file now states it: its `instance` holds `checkout`, the folder of a checkout of
the instance in which the participant works and reads files itself — on a Bridge the instance at the job's `agent_m`
commit in the offered agent's working folder, in CI the job workflow's checkout of the instance —, from which the
instance's `snapshot` is read; `null` in a browser. `prepareJob` and the recipes read the instance through it. The
routes that set it (ITM-327, ITM-365) and the chapter recipes that read it (ITM-392) are not part of this item.

## Acceptance

- Unit tests that name MOD-job-runner state, before the code exists: a context with a checkout read through it; a
  context without one read as before; a checkout at another commit than the record names refused by name.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/job-runner/` and the tests that name MOD-job-runner change.
