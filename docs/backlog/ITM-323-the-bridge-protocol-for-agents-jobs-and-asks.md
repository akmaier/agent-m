---
id: ITM-323
title: The Bridge protocol for agents, jobs and asks
level: module
realises:
  - UC-011
  - UC-017
  - THE LOCAL BRIDGE REQUIRES A TOKEN
  - A REMOTE INTERFACE NAMES HOW IT FAILS
modules:
  - MOD-bridge-http
builds_on:
  - ITM-261
tests:
  - unit
origin:
  - UC-011 steps 2 and 3
  - UC-017 steps 3 and 6
---
# ITM-323 The Bridge protocol for agents, jobs and asks

**REGISTER**

## Outcome

MOD-bridge-http's `bridgeApi` gains the routes of its table that the `jobs` handlers answer — `GET /v1/agents`, `POST
/v1/jobs`, `GET /v1/jobs`, `GET /v1/jobs/{id}/log?from={line}`, `POST /v1/jobs/{id}/cancel`, `POST /v1/ask`, `GET
/v1/ask/{ask}` — with their request and answer fields, and `serveBridge` hands each request, after the origin and token
checks it makes today, to the `jobs` handler of its route with its path parameters, query and body. While `paused()`
holds, only a request that starts work — a hand-over, an ask, a probe — answers `paused`; listing, following and
cancelling jobs still answer, as the file states. The mail routes are not part of this item.

## Acceptance

- Unit tests that name MOD-bridge-http state, before the code exists, with fixture handlers: each route reaching its
  handler with its parameters, query and body; a route without a handler `not-found`; a request without the token
  `token-refused`, its handler never called; a handler's error answered with its code's status; while paused, a
  hand-over, an ask and a probe answered `paused`, and a cancel and the list reaching their handlers; no body or query
  value in the log.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/bridge-http/` and the tests that name MOD-bridge-http change.
