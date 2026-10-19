---
id: ITM-1032
title: The settings page offers the Bridge's file for this computer
level: module
realises:
  - UC-044
  - AGENT M WORKS WITHOUT A LOCAL INSTALLATION
  - THE BRIDGE IS ONE FILE PER PLATFORM
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-settings-pages
builds_on:
  - ITM-1031
  - ITM-1037
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-044-2, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1032 The settings page offers the Bridge's file for this computer

**REGISTER**

## Outcome

MOD-settings-pages.md:198-199: "`bridge` — the release's file for this computer's system with its size and the SHA-256 the
server reports for it, or, where the server reports none, a link to the release's checksum file". UC-044 step 1
(UC-044.md:62-64): "The page explains the two levels with the table above, recognises the operating system, and offers the
one file for it — on Windows an installer —, signed by the publisher of the release, with its size and checksum", and step 2
(UC-044.md:67-69): "a folded **Why this warning?** on the download page says so, shows the publisher's name to look for, and
names **More info → Run anyway**". The route `bridge` has no download today (`src/settings-pages/bridge.mjs`).

## Acceptance

- Unit tests that name MOD-settings-pages, with a fake release of the four files of MOD-bridge-build: on macOS the `.dmg`, on
  Windows the `.exe`, on Linux the `.AppImage` is offered with its size and SHA-256; without a reported SHA-256 the checksum
  file is linked; the explanations of the two levels and of the warning are folded beside it.
- Counter-proof: offering the macOS `.zip` (the updater's file) to a person fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/settings-pages/` and the tests that name MOD-settings-pages change.
