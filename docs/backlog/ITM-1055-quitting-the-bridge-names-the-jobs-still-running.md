---
id: ITM-1055
title: Quitting the Bridge names the jobs still running
level: module
realises:
  - UC-044
  - THE BRIDGE RUNS AS AN APP
modules:
  - MOD-desktop-shell
builds_on:
  - ITM-1097
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-044-12, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1055 Quitting the Bridge names the jobs still running

**REGISTER**

## Outcome

MOD-desktop-shell.md:179-181: "*Quit* names the jobs still running, which then end as cancelled, and stops the watching, the
tunnels and the server." UC-044 7b (UC-044.md:143-144). *Quit* calls `window.bridge.quit()` at once
(`src/desktop-shell/window.mjs:15`, `:23`; `src/desktop-shell/main.mjs:107`); `stopWatching("quit")` already ends running jobs
as cancelled (`src/bridge-jobs/watch.mjs:247`).

## Acceptance

- A unit test that names MOD-desktop-shell: with two running jobs, *Quit* shows a decision naming both; confirming quits and
  both records end cancelled; declining leaves the Bridge running. With none running it quits at once.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/desktop-shell/` and the tests that name MOD-desktop-shell change.
