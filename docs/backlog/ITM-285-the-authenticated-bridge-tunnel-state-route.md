---
id: ITM-285
title: The authenticated Bridge tunnel-state route
level: module
realises:
  - UC-044
  - THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY
  - THE LOCAL BRIDGE REQUIRES A TOKEN
  - THE BRIDGE IS PAIRED ONCE
  - A REMOTE INTERFACE NAMES HOW IT FAILS
modules:
  - MOD-bridge-http
builds_on:
  - ITM-261
tests:
  - unit
origin:
  - UC-003
  - UC-044
---
# ITM-285 The authenticated Bridge tunnel-state route

**REGISTER**

## Outcome

Add only accepted GET /v1/tunnels to bridgeApi and serveBridge dispatch through the supplied BridgeHandlers.tunnels route map. Preserve the accepted { tunnels: [{ name, kind, state, reason }] } answer and handler error mapping. The server knows no tunnel behaviour; tests supply a handler with constructed states. The read-only route remains available while paused, subject to the same loopback, origin, preflight and current-token protections as every accepted request. An absent handler remains not-found; it never becomes a successful empty tunnel list.

The current protocol has only the probe route and server.mjs refuses every non-pair GET at its dispatch boundary. The accepted tunnels handler and later shell composition need this route. This protocol unit foundation has no runtime dependency on MOD-tunnels: do not add a tunnel handler, SSH, shell registration, agents/mail/jobs routes or Bridge client operation here.

## Acceptance

- Unit cases call the actual server on controlled loopback with a supplied tunnels handler and observe exact states/reasons, empty state, handler failure and absent-handler not-found. GET does not invoke jobs or retain tunnel configuration. The known-positive pair and endpoint-test routes stay working.
- Missing/refused/rotated pairing tokens and another origin reach no handler. Allowed origin/preflight works; paused GET can read states while the existing paused work refusal remains intact. Request logs contain only method/path/status/duration, never headers, body or credentials.
- Only src/bridge-http/ and new tests naming MOD-bridge-http change. Preserve every existing protocol/client/server guard and expected result; do not assume routes[0] is still the probe if data order changes.
- The first writing commit contains only new tests and has actual red CI before implementation. Final exact-head full CI is green. Each new case declares a unique numeric TST, one unit level, module, guarded requirement/use case, readable precondition/input/expected result and its own executed relevant guarded-code fault, failure and byte-exact-restored positive. Existing expected results are not weakened. No paid service is called.
- The source PR names its concrete accepted consumer/data path and the actual failure node. Independent selected-item release coverage follows the approved merge; module source readiness and the aggregate release gate remain distinct.
