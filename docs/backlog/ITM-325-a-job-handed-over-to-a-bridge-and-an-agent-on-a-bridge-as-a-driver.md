---
id: ITM-325
title: A job handed over to a Bridge, and an agent on a Bridge as a driver
level: module
realises:
  - UC-011
  - A RUNTIME IS INTERCHANGEABLE
  - A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
  - A REMOTE INTERFACE NAMES HOW IT FAILS
modules:
  - MOD-runtimes
builds_on:
  - ITM-324
  - ITM-318
  - ITM-319
tests:
  - unit
origin:
  - UC-011 steps 2 and 2a
---
# ITM-325 A job handed over to a Bridge, and an agent on a Bridge as a driver

**REGISTER**

## Outcome

`queueJob`'s Bridge route, in MOD-runtimes' part `bridge.mjs`, as its file states it: the start record committed on the
head that was read, as the person's commit, then, with the Bridge the participant's route names, the job handed over
with its record's path and that commit (ITM-324). A hand-over that fails after the commit is reported with its
`BridgeError`, and the job stays queued for the Bridge to take when it next reads the repository. `bridgeDriver(bridge,
target, participant)`: a driver whose `send` hands the input to the named agent on the Bridge, or to the endpoint the
Bridge calls, through `ask`, and returns its answer and usage; `runOnTab` builds it for an agent on a Bridge and for an
endpoint whose configuration names a Bridge, each Bridge by its name among `connections.bridges` (ITM-319). A job of a
run, resuming, live state, log, cancel and retry are not part of this item.

## Acceptance

- Unit tests that name MOD-runtimes state, before the code exists, with the host and the Bridge client replaced: the
  start committed and handed over to the named Bridge with its path and commit; a hand-over refused after the commit —
  blocked by the browser, token refused, paused — reported by name, the start left committed; `bridgeDriver` returning
  an agent's text and usage and an endpoint's answer, and failing with the Bridge client's error by name; `runOnTab`
  choosing the Bridge by its name.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/runtimes/` and the tests that name MOD-runtimes change.
