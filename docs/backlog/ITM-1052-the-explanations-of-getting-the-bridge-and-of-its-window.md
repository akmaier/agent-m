---
id: ITM-1052
title: The explanations of getting the Bridge and of its window
level: module
realises:
  - UC-044
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-044-9, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1052 The explanations of getting the Bridge and of its window

**REGISTER**

## Outcome

MOD-site-frame.md:100-103: `explanations.md` "holds the topics of the site's pages and those of the Bridge's window ...: the
coding agents and how to install a missing one, the pairing token and pairing anew, the jump host and the public key, the
tunnels, importing a settings export, updates, and why a newly signed release may still be warned about." Of the Bridge's,
`explanations.md` holds `bridge-pairing`, `bridge-own-login` and `bridge-https-route` (`:277`, `:483`, `:489`). Missing: the
two levels of UC-044's table, the warning of a newly signed release (*Why this warning?*, UC-044.md:67-69), installing a
missing agent, the jump host and the public key, the tunnels, importing an export in the window, and updates.

## Acceptance

- `explanations.md` holds each topic above; the frame's own check finds none missing for the page `bridge` and the route
  `bridge`.
- A unit test that names MOD-site-frame renders each, with a counter-proof of a topic left out.
- Only `src/site-frame/` and the tests that name MOD-site-frame change.
