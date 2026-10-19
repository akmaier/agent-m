---
id: ITM-1035
title: The Bridge's Agents view checks again for a newly installed agent
level: module
realises:
  - UC-044
  - THE BRIDGE GUIDES THE INSTALLATION OF A MISSING AGENT
  - THE BRIDGE FINDS THE INSTALLED AGENTS
modules:
  - MOD-desktop-shell
builds_on:
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-044-7, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1035 The Bridge's Agents view checks again for a newly installed agent

**REGISTER**

## Outcome

MOD-desktop-shell.md:166-167: "*Agents* — every supported agent with its version, ready and logged in, or missing with its
vendor's installation page for this platform, and *Check again*". UC-044 3a (UC-044.md:106-107): "After installing one,
**Check again** lists it." The view has *How to install* (`src/desktop-shell/window.mjs:48`) and no *Check again*.

## Acceptance

- A unit test that names MOD-desktop-shell, with fixture executables: an agent missing at the first reading and put on the
  path is listed as installed after *Check again*, without restarting the Bridge.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/desktop-shell/` and the tests that name MOD-desktop-shell change.
