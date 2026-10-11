---
id: ITM-421
title: A mailbox operation through a Bridge
level: module
realises:
  - UC-037
  - THE MAILBOX PASSWORD LEAVES THE BROWSER ONLY TO THE BRIDGE
  - A CREDENTIAL IS NEVER PLACED IN A URL
  - THE LOCAL BRIDGE REQUIRES A TOKEN
modules:
  - MOD-bridge-client
builds_on:
  - ITM-419
tests:
  - unit
origin:
  - UC-037 step 7, 7a
---
# ITM-421 A mailbox operation through a Bridge

**REGISTER**

## Outcome

MOD-bridge-client's `mailCall(bridge, operation, connection, args)`, as its file states it: `POST /v1/mail/{operation}`
with `{ connection, args }`, the connection and its password only in that request's body, with the Bridge's token and,
for a Bridge reached through the jump host, the web server's login, as the client's other requests carry them; the
answer returned as the Bridge gives it. It fails with the `BridgeError`s the file names — `NoAnswer` with its likely
causes, `TokenMissing`, `TokenRefused`, `BridgeFailed` with `confirmation-refused`, `no-encryption`, `login-refused`,
`upstream-failed` or `paused`, and `Timeout`. MOD-mail-routes' Bridge route calls it (ITM-425).

## Acceptance

- Unit tests that name MOD-bridge-client state, before the code exists, against a fake Bridge: the request's method,
  path and body for `test`; the token in its header and the password in its body only, never in its address; each error
  of the Bridge answered as its `BridgeError`, `no-encryption` with the server it names.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/bridge-client/` and the tests that name MOD-bridge-client change.
