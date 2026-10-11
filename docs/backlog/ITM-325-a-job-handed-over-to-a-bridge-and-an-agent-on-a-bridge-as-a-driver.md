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
tests:
  - unit
origin:
  - UC-011 steps 2 and 2a
---
# ITM-325 A job handed over to a Bridge, and an agent on a Bridge as a driver

**REGISTER**

## Outcome

`queueJob`'s Bridge route, in MOD-runtimes' part `bridge.mjs`, as its file states it: the start record committed on the
head that was read, as the person's commit, then, with a Bridge given, the job handed over with its record's path and
that commit (ITM-324). A hand-over that fails after the commit is reported with its `BridgeError`, and the job stays
queued for the Bridge to take when it next reads the repository. `bridgeAgentDriver`: a driver whose `send` asks the
named agent on the Bridge through `askAgent`, for a job this tab runs with a CLI agent as drafter. The tab's route
(ITM-319), a job of a run, resuming, live state, log, cancel and retry are not part of this item.

## Acceptance

- Unit tests that name MOD-runtimes state, before the code exists, with the host and the Bridge client replaced: the
  start committed and handed over with its path and commit; a hand-over refused after the commit — blocked by the
  browser, token refused, paused — reported by name, the start left committed; `bridgeAgentDriver` returning the
  agent's text and usage, and failing with the Bridge client's error by name.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/runtimes/` and the tests that name MOD-runtimes change.
