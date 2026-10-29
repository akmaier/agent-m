---
id: ITM-1312
title: The tunnels runtime release test waits for the states it asserts
level: module
realises:
  - A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
modules:
  - MOD-tunnels
builds_on: []
tests:
  - unit
origin:
  - po-opus-c's gate of sprint team1/119 (PR #1461), docs/gates/20261029-1536-release-testing-sprint-review-5e8b.md, point 3
---
# ITM-1312 The tunnels runtime release test waits for the states it asserts

**REGISTER**

## Outcome

On commit `3836359c`, job 123546570337 of run 40901982501 (attempt 1) failed TST-286904 in
`tests/release-itm-286-tunnels-runtime.test.mjs` ("public runtime isolates failures, grows reconnect waits, and stops
reconnecting after close"). Its rerun, job 123548956750 (attempt 2), passed: the test flips on the same commit. In the
failing run, the worker's check found the denied tunnel in the state `opening` with the reason `auth-refused` where it
waited for that tunnel's settled state, within its 90 polls. The test waits on the tunnels' states, not on a count of
polls, and gives the same outcome on every run of one commit.

**First task:** reproduce the flip (sprint 118's agreement), for example by running the case repeatedly under load, and
name the data-flow path from the poll to the failing assertion. Where it does not reproduce on today's code, the item
stops and reports the runs.

## Acceptance

- The test's expected results are unchanged. Its wait ends when the asserted states are reached, and fails by name when
  they do not come.
- Only the test and its helpers change.
