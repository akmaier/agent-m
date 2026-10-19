---
id: ITM-1036
title: Each view of the Bridge's window carries its own explanation
level: module
realises:
  - UC-044
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-desktop-shell
builds_on:
  - ITM-1037
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-044-8, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1036 Each view of the Bridge's window carries its own explanation

**REGISTER**

## Outcome

MOD-desktop-shell.md:165: "The window's views, drawn with the site's frame as the page `bridge`, each with its explanation".
UC-044 step 3 (UC-044.md:73-74): "A folded explanation says that the agent will use its own login on this computer, so no key
is needed and the person's subscription pays." Every view calls `explain("bridge-pairing")` (`src/desktop-shell/window.mjs`,
five calls); the topic `bridge-own-login` exists (`src/site-frame/explanations.md:483`) and no view names it.

## Acceptance

- A unit test that names MOD-desktop-shell: *Agents*, *Pairing*, *Tunnels*, *Settings* and *Updates* each name their own topic,
  *Agents* `bridge-own-login`; the frame's own check finds every topic named.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/desktop-shell/` and the tests that name MOD-desktop-shell change.
