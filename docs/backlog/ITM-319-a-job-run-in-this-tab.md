---
id: ITM-319
title: A job run in this tab
level: module
realises:
  - UC-005
  - UC-007
  - UC-019
  - A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
  - ONE DEFINITION, THREE DRIVERS
  - THE ROUNDS ARE COUNTED AND SHOWN
modules:
  - MOD-runtimes
builds_on:
  - ITM-253
  - ITM-316
  - ITM-317
tests:
  - unit
origin:
  - UC-005 step 4
  - UC-007 step 3
  - UC-019 step 6
---
# ITM-319 A job run in this tab

**REGISTER**

## Outcome

MOD-runtimes' tab route, as its file states it: `queueJob` on the route `{ kind: "tab" }`, whose start and taking are
one commit, the person's, on the head that was read; and `runOnTab`, which runs the prepared job with MOD-job-runner —
attended unless its record names a run —, builds the drafter's and the reviewers' drivers from their model endpoints'
configurations (ITM-316), appends a gate reached and the end, with the rounds, to the job's record (ITM-317), and
returns the result for the page. `bridgeAgentDriver` and the Bridge's route (ITM-325), `routesFor` (ITM-318),
`liveState` and the other functions are not part of this item.

## Acceptance

- Unit tests that name MOD-runtimes state, before the code exists, with a fixture host and a fixture endpoint driver:
  the start and the taking in one commit; an attended job of a kind whose result waits for a person returning its
  draft with nothing written; a kind of `review: none` written at once; the end with its rounds appended to the
  record; a failing driver ending the job by name with the end appended.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/runtimes/` and the tests that name MOD-runtimes change.
