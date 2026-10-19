---
id: ITM-1006
title: The Bridge's icons
level: module
realises:
  - UC-044
  - THE BRIDGE RUNS AS AN APP
modules:
  - MOD-desktop-shell
builds_on:
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-044-17, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1006 The Bridge's icons

**REGISTER**

## Outcome

`src/desktop-shell/app.json:6` and `src/desktop-shell/index.mjs:4` name `icons/macos.png`, `icons/windows.png` and
`icons/linux.png`, but `src/desktop-shell/icons/` does not exist.

## The accepted text

Quoted from `main` at 40e04d8d, MOD-desktop-shell.md:82:

> - `icons/` — the app's icon for each platform, and the icon of the menu bar and the tray.

## Acceptance

- A unit test naming MOD-desktop-shell: each icon the app description names, and the icon of the menu bar and the tray,
  exists under `src/desktop-shell/icons/` and is a PNG file; the tray is created with its icon.
- Counter-proof: a named icon removed fails the test.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/desktop-shell/` and the tests that name MOD-desktop-shell change.
