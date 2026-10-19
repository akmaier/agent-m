---
id: ITM-1053
title: The jump host is set in the Bridge's window
level: module
realises:
  - UC-044
  - THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT
  - THE BRIDGE OPENS ITS TUNNELS ITSELF
modules:
  - MOD-desktop-shell
builds_on:
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-044-10, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1053 The jump host is set in the Bridge's window

**REGISTER**

## Outcome

MOD-desktop-shell.md:64-65: "It keeps the Bridge's settings, set in the window or taken from the dashboard's export", and
:174: "*Tunnels* — the jump host; the Bridge's public key with *Copy* ...". UC-044 6a.1 (UC-044.md:123-124): "In the bridge's
window the person enters the jump host — hostname, SSH user —, or imports the dashboard's settings export". The window offers
only the export: `src/desktop-shell/window.mjs:104` "Set a jump host in a settings export to open tunnels." The settings file
already keeps `jumpHost` (`src/desktop-shell/settings.mjs:12`, `:35`).

## Acceptance

- A unit test that names MOD-desktop-shell: hostname, SSH user and port entered in the window are kept in `settings.json`'s
  `jumpHost`, and the Tunnels view then names `user@hostname` in its sentence; an empty hostname is refused.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/desktop-shell/` and the tests that name MOD-desktop-shell change.
