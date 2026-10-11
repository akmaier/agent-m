---
id: ITM-403
title: Each Bridge kept under its name in the browser
level: module
realises:
  - UC-003
  - UC-011
  - UC-042
  - CONFIGURATION LIVES IN THE BROWSER
  - THE JUMP HOST AND THE REMOTE SESSIONS ARE SETTINGS
  - SETTINGS ARE EXPORTED AND IMPORTED WITH THEIR SECRETS
  - A CLEAR IS A REAL CLEAR
modules:
  - MOD-browser-store
builds_on:
  - ITM-259
  - ITM-279
  - ITM-283
tests:
  - unit
origin:
  - UC-011 1a, 1c, 1d
  - UC-042 step 1
---
# ITM-403 Each Bridge kept under its name in the browser

**REGISTER**

## Outcome

MOD-browser-store, as its file now states it: the family `bridge:<name>` replaces the single `bridge` and the family
`remote-session:<name>` — `{ address, token }` for a Bridge reached directly, `{ port, token }` for one reached through
the jump host —, each listed, cleared and exported with its token as a secret; an endpoint's entry keeps `bridge`, the
name of the Bridge that calls it, in place of `throughBridge`.

## Acceptance

- Unit tests that name MOD-browser-store state, before the code exists: two Bridges of each form kept, listed, exported
  and imported with their tokens; one cleared with its entry removed; an endpoint naming its Bridge.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/browser-store/` and the tests that name MOD-browser-store change.
