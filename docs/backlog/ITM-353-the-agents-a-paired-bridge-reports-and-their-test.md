---
id: ITM-353
title: The agents a Bridge offers, and their test
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
built_by:
  - 0c1aed27429a0ed7afc0dc56eeea67604a004e49
  - 53e81f1df798981cf39115e6908554e9e8c9f98a
---
# ITM-353 The agents a Bridge offers, and their test

**REGISTER**

## Outcome

On the participants page (ITM-352), for a CLI or sandboxed agent: the agents the chosen Bridge offers, through
`testBridge` (ITM-324), each ready one added in one click with that Bridge's computer as its processing place; a Bridge
reached through the jump host chosen like any other of this browser's Bridges (UC-011 1c); *Test*, a harmless request
through `probe` with the kind `agent` on that Bridge, showing what answered; when the Bridge does not answer, the reason
the client names — not running, wrong address, token missing, blocked by the browser — and nothing saved until the
person decides to save untested (6a).

## Acceptance

- Unit tests that name MOD-settings-pages state, before the code exists, with the Bridge client replaced: the agents of
  the chosen Bridge offered, a ready one added in one click; another Bridge's agents after choosing it; *Test* answered
  and shown; each failure named, and *Save* withheld until the person chooses to save untested.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/settings-pages/` and the tests that name MOD-settings-pages change.

**Done (sprint team2/98, po-opus-b):** read against its Acceptance on `main` at `3436203a`: TST-353001 and TST-353002 (`tests/settings-pages-participants.test.mjs:406`, `:462`) state each Acceptance line (the chosen Bridge's agents, one-click add, *Test* through `probe`, *Save* withheld until saved untested) and pass on `main`; `src/settings-pages/participants.mjs:571`, `:601`; built in team 2's sprint 42 (`53e81f1d`). No pull request names it, since it predates the pull-request flow or was built by another item. No code changes.
