---
id: ITM-813
title: The release tests that the bridge binds to loopback and requires its token
level: system
realises:
  - UC-044
  - THE LOCAL BRIDGE BINDS TO LOOPBACK ONLY
  - THE LOCAL BRIDGE REQUIRES A TOKEN
  - THE BRIDGE IS PAIRED ONCE
modules:
  - MOD-bridge-http
builds_on:
tests:
  - release
origin:
  - akmaier's instruction of 2026-10-17 that team 2 plans around team 1
---
# ITM-813 The release tests that the bridge binds to loopback and requires its token

**REGISTER**

## Outcome

`tests/test_bridge_loopback.py` and `tests/test_bridge_token.py`, the checks SPEC.md names for `THE LOCAL BRIDGE BINDS TO
LOOPBACK ONLY`, `THE LOCAL BRIDGE REQUIRES A TOKEN` and `THE BRIDGE IS PAIRED ONCE`, do not exist. MOD-bridge-http's
`serveBridge` and `pairAnew` are built (`src/bridge-http/server.mjs`, `src/bridge-http/pairing.mjs`). The tests start the
real server in Node on a temporary data folder, as `tests/test_bridge_mail.py` drives a Bridge module.

## Acceptance

- `serveBridge` starts on `127.0.0.1`, `::1` and `localhost`, and refuses `0.0.0.0`, an empty host and a non-loopback
  address with `BindRefused`.
- A request without the token, or with another one, is answered `401` `token-refused` on every route; with the token in
  force it is answered.
- After a restart on the same data folder the stored token is accepted, and the token's file is readable and writable by
  its owner only; after `pairAnew` the old token is refused, by the server already running too.
- Each test names the requirement it guards, the module it exercises and its level `release`; its cases stand in a
  Markdown data file beside it, and the Python file only loads them (AGENTS.md §7).
- It is written by a participant who implemented none of the behaviour it tests; each test's counter-proof — a fault
  planted in the module, and the test failing on it — is recorded in the pull request.
- Only the new test files and their data files change.
