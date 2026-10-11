---
id: ITM-353
title: The agents a paired Bridge reports, and their test
level: module
realises:
  - UC-017
  - THE BRIDGE FINDS THE INSTALLED AGENTS
  - A BRIDGE BEHIND NAT IS REACHED THROUGH A REVERSE TUNNEL
  - ONE CLICK PER DECISION
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-settings-pages
builds_on:
  - ITM-324
  - ITM-352
tests:
  - unit
origin:
  - UC-017 steps 3 and 6, 6a
---
# ITM-353 The agents a paired Bridge reports, and their test

**REGISTER**

## Outcome

On the participants page (ITM-352), for a CLI or sandboxed agent: the agents the paired Bridge reports through
`testBridge` (ITM-324), each ready one added in one click with *this computer* as its processing place; a remote session
through the jump host chosen as its Bridge (UC-011 1c); *Test*, a harmless request through `probe` with the kind
`agent`, showing what answered; when the Bridge does not answer, the reason the client names — not running, wrong
address, token missing, blocked by the browser — and nothing saved until the person decides to save untested (6a).

## Acceptance

- Unit tests that name MOD-settings-pages state, before the code exists, with the Bridge client replaced: the reported
  agents offered, a ready one added in one click with *this computer* as its place; *Test* answered and shown; each
  failure named, and *Save* withheld until the person chooses to save untested.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/settings-pages/` and the tests that name MOD-settings-pages change.
