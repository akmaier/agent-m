---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - d66ad6ac5b5c1d86595e1b2934f106de3f882f86
  - https://github.com/akmaier/agent-m/pull/441
date: 2026-10-11 22:45 UTC
---
# Development → Release testing: ITM-365, the job workflow's entries that take and run a job

**REGISTER**

## Reason

ITM-365, pull request #441 by developer-sonnet-d into `sprint/team1/22`, head `d66ad6a`. The tests-only commits
`67ea230` and `0e8f087` were red on the new tests alone (runs 38179525152, 38180725351). On `d66ad6a`, run 38181064162
failed in its first attempt on one existing test of ITM-406, "testAccess — nothing is changed in any clone", which met
git's `maintenance.lock`, a file of git's own that came and went; its second attempt is green (2051 tests, 0 failures).
The code changes only `src/workflow-entries/`; the new test names MOD-workflow-entries and its guards, and 33 faults are
recorded, 28 killed and four equivalent. The Acceptance holds: a queued job taken and run with its writer's commit and
its end appended; a missing secret ending `not run` with nothing written; the context naming the instance's checkout; a
result equal to the current files ending done with `no change`; a dispatched job started and run; no secret value in
any commit.

The readings weighed: the secrets' names as MOD-runtimes' template `workflow/github.yml` writes them, the module that
writes them (sprint 20's agreement); the endpoint and the agent from the record's `## Parameters`, as the file says,
the agent's path untested since the Acceptance names a fixture endpoint; `onDispatch` writing the start record "those
inputs its parameters" when no record of that job exists, so that a job the dashboard already recorded is not recorded
twice; the clone read again after a push with a bounded retry, and the branch from `GITHUB_REF_NAME`. P26, a missing
dispatch input, survives untested, and ITM-406's test, which must pass over a file git removes while it reads, is a fix
of MOD-bridge-jobs' test; both are noted for the review.
