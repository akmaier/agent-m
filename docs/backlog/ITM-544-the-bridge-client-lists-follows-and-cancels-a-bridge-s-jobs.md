---
id: ITM-544
title: The Bridge client lists, follows and cancels a Bridge's jobs
level: module
realises:
  - UC-036
  - ONE DASHBOARD SHOWS EVERY JOB
  - A CANCELLED JOB WRITES NOTHING MORE
modules:
  - MOD-bridge-client
builds_on:
tests:
  - unit
origin:
  - MOD-bridge-client, Interfaces: bridgeJobs, bridgeJobLog, cancelOnBridge — in its `provides`, not built
  - sprint team1/45: ITM-535's Bridge route needs them; ITM-324 left them out
---
# ITM-544 The Bridge client lists, follows and cancels a Bridge's jobs

**REGISTER**

## Outcome

MOD-bridge-client's `bridgeJobs`, `bridgeJobLog` and `cancelOnBridge`, as its file states them, over the Bridge's routes
that MOD-bridge-http's `bridgeApi` already declares (`src/bridge-http/protocol.mjs`):
- `bridgeJobs(bridge)` is `GET /v1/jobs` and gives `jobs`;
- `bridgeJobLog(bridge, id, from)` is `GET /v1/jobs/{id}/log?from={from}` and gives `{ lines, next, ended }`;
- `cancelOnBridge(bridge, id)` is `POST /v1/jobs/{id}/cancel` and gives `{ confirmed }`.

They are sent as the client's other calls are — `handOver` and `ask` in `src/bridge-client/index.mjs` — with the Bridge's
address and its pairing token, and they fail with the same `BridgeError`s. `AskFailed` is not among them, as the file says.
A job the Bridge does not know is `BridgeFailed` with `not-found`.

No existing test's expected result changes. The tests of `handOver` and `ask` are unchanged.

## Acceptance

- Against a fixture Bridge, each of the three sends exactly its route's request, with the token, and gives the answer.
- An unknown job is `BridgeFailed` with `not-found`; a Bridge that does not answer is the client's usual failure.
- The first commit holds only the tests, and CI is red on it, the stub run recorded where only a missing export makes it
  red.
- Each test states its expected values in its own text.
