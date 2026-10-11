---
id: ITM-407
title: The agents a Bridge offers, chosen in its window with their folders
level: module
realises:
  - UC-011
  - UC-044
  - THE BRIDGE FINDS THE INSTALLED AGENTS
  - THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT
modules:
  - MOD-desktop-shell
builds_on:
  - ITM-291
  - ITM-320
  - ITM-406
tests:
  - unit
origin:
  - UC-044 step 3
  - UC-011 3b
---
# ITM-407 The agents a Bridge offers, chosen in its window with their folders

**REGISTER**

## Outcome

In MOD-desktop-shell's window and settings, as its file states them: the *Agents* view lists the supported agents of
this computer with how to install a missing one (ITM-320), a tick for each installed agent the Bridge is to offer, and
the working folder of each ticked one, chosen with the system's folder dialog; *Test access* through `testAccess`
(ITM-406); `settings.json` keeps `agents`, each with its folder, and an agent no longer installed stays listed as
missing. The composition hands the offered agents to the job handlers and to watching (ITM-367).

## Acceptance

- Unit tests that name MOD-desktop-shell state, before the code exists, with fixture executables and a temporary folder:
  two installed agents, one ticked with a folder and kept in the settings; the unticked one not offered; a missing one
  shown with its installation page; *Test access* showing a refused repository.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/desktop-shell/` and the tests that name MOD-desktop-shell change.
