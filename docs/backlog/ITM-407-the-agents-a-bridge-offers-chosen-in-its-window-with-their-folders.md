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
built_by:
  - 98e006d9b17ee6177d3340f64e14872490ad552b
  - e8dcd80799c1cd175f48f9b76df81e1ee73f9471
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

## Built (read on main by po-opus-b, 2026-10-19)

Built in team 2's sprint 33, before the pull-request flow: `d3fd9221`, `98e006d9` (tests) and `e8dcd807`, with TST-407001 and
TST-407002 in `tests/mod-desktop-shell-agents.test.mjs`. No pull request names the item, so the backlog's state did not show it
done. Sprint 97's selection of it (97.md) was the Product Owner's mistake.

**Done (sprint team2/98, po-opus-b):** read against its Acceptance on `main` at `3436203a`: TST-407001 and TST-407002 (`tests/mod-desktop-shell-agents.test.mjs`) pass on `main`; built in team 2's sprint 33. No pull request names it, since it predates the pull-request flow or was built by another item. No code changes.
