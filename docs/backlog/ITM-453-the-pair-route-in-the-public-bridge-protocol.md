---
id: ITM-453
title: The pair route in the public Bridge protocol
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
  - ITM-323
tests:
  - unit
origin:
  - MOD-bridge-http Data, GET /v1/pair
  - MOD-bridge-client Responsibility and Uses
  - ITM-324 source gate, PR362
---
# ITM-453 The pair route in the public Bridge protocol

**REGISTER**

## Outcome

Expose the already accepted `GET /v1/pair` in MOD-bridge-http's public `bridgeApi.routes`,
with its method, path and answer fields `{ bridge: { name, version, platform }, origin }`
as MOD-bridge-http's Data states them. The server already answers this route itself;
its reply, token/origin checks and behavior stay unchanged. MOD-bridge-client's
`testBridge` can then read that request from the public protocol rather than duplicate it.
Only this missing protocol datum is added; job, probe and tunnel declarations stay intact.
No new pairing return shape, settings migration or client implementation belongs here.

## Acceptance

- Unit tests naming MOD-bridge-http state the public pair descriptor's method, path and
  answer fields before implementation, through the browser-loadable public module.
  The existing server's authenticated pair answer remains the positive behavior path.
- The first commit contains only tests and has its own actual red CI. The final exact
  head has green full CI; each new case has a recorded relevant planted-fault failure
  and the same case passing after exact source restoration.
- Existing tests stay green with no expected result changed. Pairing persistence,
  rotation, origin/token refusals, preflight, pause, logging, endpoint-test, tunnel and
  delivered job/ask behavior remain guarded by their existing tests.
- Only `src/bridge-http/` and tests naming MOD-bridge-http change. Do not add unrelated
  routes, alter server dispatch or errors, or change another module. Constructed/controlled
  fixtures call no paid service; all execution is GitHub Ubuntu CI within120 seconds/job.
