---
id: ITM-404
title: Bridges by name in the Bridge client
level: module
realises:
  - UC-011
  - UC-044
  - A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST
  - EACH REMOTE SESSION HAS ITS OWN PORT FROM THE CONFIGURED RANGE
  - THE BRIDGE IS PAIRED ONCE
modules:
  - MOD-bridge-client
builds_on:
  - ITM-263
  - ITM-282
tests:
  - unit
origin:
  - UC-011 1a, 1c, 1d
  - UC-044 step 4, 4d
---
# ITM-404 Bridges by name in the Bridge client

**REGISTER**

## Outcome

MOD-bridge-client, as its file now states it: `BridgeEntry`; `settingsOf(entry, jumpHost)` — a Bridge's own address, or
for one reached through the jump host its HTTPS address with the path `/bridge/<name>` and the web server's login, or
the forward of its port without an HTTPS address, `JumpHostMissing` without a jump host —; `pair` returning the name the
Bridge reports with the settings; and `allocatePort`, `tunnelCommands` and `proxyConfiguration` over Bridge entries, the
path made in one place for both. No request is made by these but `pair`.

## Acceptance

- Unit tests that name MOD-bridge-client state, before the code exists: the settings of a direct, an HTTPS and a
  forwarded Bridge; `JumpHostMissing`; the pairing answer's name returned; the lowest free port over Bridge entries; the
  proxy configuration naming each Bridge's path and its port.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/bridge-client/` and the tests that name MOD-bridge-client change.
