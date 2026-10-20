---
id: ITM-1054
title: The Bridge offers a newer release and installs it only after the person's clicks
level: module
realises:
  - UC-044
  - THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE
modules:
  - MOD-desktop-shell
builds_on:
  - ITM-955
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-044-11, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1054 The Bridge offers a newer release and installs it only after the person's clicks

**REGISTER**

## Outcome

MOD-desktop-shell.md:182-192: "**Updates** (`THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE`), through electron-updater with
`autoDownload` off ... it offers a newer release only when the feed's detached signature holds against the publisher's key
built into the app ... *Download* — the person's click — fetches the file, which becomes installable only when its own
detached signature holds ...; otherwise the file is deleted and the window says that it is not the publisher's. *Install and
restart* — a second click, after a decision that names the jobs that would end as cancelled — calls `quitAndInstall()`."
The Parts name `updates.mjs` (MOD-desktop-shell.md:78); it does not exist, and the window has no *Updates* view
(`src/desktop-shell/window.mjs:107`). UC-044 7a (UC-044.md:141-142).

## Acceptance

- Unit tests that name MOD-desktop-shell, with a fake update feed and a test key: a newer release with a valid feed signature
  is offered with its notes; a feed whose signature fails offers nothing; a downloaded file whose signature fails is deleted
  and named; *Install and restart* names the running jobs and installs only after its decision.
- Counter-proof: an update installed without the second click fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/desktop-shell/` and the tests that name MOD-desktop-shell change.

**From the gate of #1118 (ITM-1051).** The *Updates* view (MOD-desktop-shell.md:179) is built by this item, and it names its own
explanation, `bridge-updates`, already in `src/site-frame/explanations.md`.
