---
id: ITM-324
title: The Bridge client for agents, hand-overs and asks
level: module
realises:
  - UC-011
  - UC-017
  - THE BRIDGE FINDS THE INSTALLED AGENTS
  - THE LOCAL BRIDGE REQUIRES A TOKEN
  - A REMOTE INTERFACE NAMES HOW IT FAILS
modules:
  - MOD-bridge-client
builds_on:
  - ITM-323
  - ITM-263
tests:
  - unit
origin:
  - UC-011 steps 2 and 2a, 3a
  - UC-017 steps 3 and 6, 6a
---
# ITM-324 The Bridge client for agents, hand-overs and asks

**REGISTER**

## Outcome

MOD-bridge-client's `testBridge`, `handOver`, `ask` and `probe` with the kind `agent`, as its file states them, over the
routes of ITM-323, with the token and the jump host's login as today: `testBridge`'s second request lists the agents the
Bridge offers and those missing on its computer; `ask(bridge, target, input)` sends `{ agent, input }` or `{ endpoint,
input }`, the endpoint's configuration and key only in that request's body, and polls until `done` or `failed`. Each
fails with the `BridgeError` the file names — `NoAnswer` with its likely causes, `blocked by the browser` first for
`http://127.0.0.1` from the Pages site, with the route over HTTPS named (UC-011 2a); `TokenMissing`; `TokenRefused`;
`BridgeFailed` with `paused` or `invalid-request`; `AskFailed`; `Timeout`. `bridgeJobs`, `bridgeJobLog`,
`cancelOnBridge` (UC-036), `mailCall` (UC-037), the probes `endpoint-models` and `partitions` (UC-003, UC-040), and
`settingsOf` and the Bridge entries (ITM-404) are not part of this item.

## Acceptance

- Unit tests that name MOD-bridge-client state, before the code exists, with `fetch` replaced: each call's method, path,
  body and token header, and its answer; `testBridge`'s two requests with the agents offered and those missing; `ask`
  polling until `done` for an agent and for an endpoint, the key in no address, and `AskFailed` on `failed`; each
  `BridgeError` from the answer that causes it; no request without a token.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/bridge-client/` and the tests that name MOD-bridge-client change.
