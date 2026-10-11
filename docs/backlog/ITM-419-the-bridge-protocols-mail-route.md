---
id: ITM-419
title: The Bridge protocol's mail route
level: module
realises:
  - UC-037
  - A MAILBOX IS REACHED THROUGH ITS PROVIDER'S WEB API OR THROUGH THE BRIDGE
  - THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE
  - THE LOCAL BRIDGE REQUIRES A TOKEN
modules:
  - MOD-bridge-http
builds_on:
tests:
  - unit
origin:
  - UC-037 step 7
---
# ITM-419 The Bridge protocol's mail route

**REGISTER**

## Outcome

MOD-bridge-http, as its file states it: `bridgeApi` gains the route `POST /v1/mail/{operation}` — `{ connection, args }`
in, the operation's answer out — with its ten operations, the fields of `confirm-send` and `send`, and the errors
`confirmation-refused` (409), `no-encryption`, `login-refused` and `upstream-failed` (502). `serveBridge` hands a mail
request, after the origin and token checks it makes today, to the `mail` handler of its operation, passes its arguments
and answer through without reading them, and answers `paused` for it while `paused()` holds; its log keeps no body, so
neither a connection nor its password. The Bridge's mail handlers (ITM-420) and the client's `mailCall` (ITM-421) use
it; serving the handlers in the Bridge is ITM-430's.

## Acceptance

- Unit tests that name MOD-bridge-http state, before the code exists: the route and its operations in `bridgeApi`; a
  mail request reaching the `mail` handler of its operation with its body, and its answer returned unchanged; refused
  without the token and from another origin; `paused` while paused, while the routes that follow a running job still
  answer; an operation without a handler answered `not-found`; a handler's error answered with its code; no part of a
  request's body in the log.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/bridge-http/` and the tests that name MOD-bridge-http change.
