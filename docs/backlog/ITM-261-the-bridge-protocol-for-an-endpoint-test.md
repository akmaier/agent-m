---
id: ITM-261
title: The Bridge protocol for an endpoint test
level: module
realises:
  - UC-003
  - THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY
  - THE LOCAL BRIDGE REQUIRES A TOKEN
  - THE BRIDGE IS PAIRED ONCE
  - A CREDENTIAL IS NEVER PLACED IN A URL
modules:
  - MOD-bridge-http
builds_on: []
tests:
  - unit
origin:
  - UC-003
---
# ITM-261 The Bridge protocol for an endpoint test

**REGISTER**

## Outcome

Build bridgeApi, serveBridge and pairAnew only as needed to pair and dispatch UC-003's endpoint-test operation. Binding, origin/preflight restrictions, token persistence, rotation, pause and secret-free logging follow MOD-bridge-http. Endpoint configuration belongs in the request body and is not retained. Other work handlers, the Electron app and mail/tunnel/job execution are outside this item.

Use MOD-bridge-http's accepted `POST /v1/probes/endpoint-test`: JSON `{ args }`, where `args` is the protocol's endpoint-test configuration `{ name, kind, baseUrl, model, key }`, and JSON `{ answer }`, where `answer` is its success or diagnosis result. The pairing token stays in `X-Agent-M-Bridge-Token`. The protocol defines the field types, named errors and HTTP statuses; endpoint-models remains a separate models-list probe.

## Acceptance

- New unit tests with fakes cover accepted/refused bind addresses, missing/refused pairing token, allowed/refused origin and preflight, persisted token and rotation, pause, dispatch and named invalid/upstream errors.
- No key, pairing token or login enters a URL or request log; no endpoint setting is written to disk. The token file is outside a repository and has the accepted user-only permissions.
- Build only this slice of the accepted contract, not an invented endpoint route. Only src/bridge-http/ and new tests naming MOD-bridge-http change.
- The tests-only first commit has red CI; final-head CI is green; every new test has a recorded planted-fault counter-proof. Tests use constructed responses and no paid service.
