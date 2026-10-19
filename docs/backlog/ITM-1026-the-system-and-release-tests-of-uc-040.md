---
id: ITM-1026
title: The system and release tests of UC-040
level: system
realises:
  - UC-040
  - A PRODUCT DECLARES ITS RESOURCES
  - A RESTRICTED RESOURCE IS REFERENCED, NEVER COPIED
  - A PINNED RESOURCE MOVES ONLY WHEN A PERSON MOVES IT
  - INSTANCE AND PRODUCT RESOURCES ARE INDEPENDENT
modules:
  - MOD-settings-pages
  - MOD-resource-list
builds_on:
  - ITM-642
  - ITM-996
  - ITM-960
  - ITM-1025
tests:
  - system
  - release
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-040-5, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1026 The system and release tests of UC-040

**REGISTER**

## Outcome

UC-040's postcondition (:193-199): "`docs/resources.md` of the product repository names every resource the product is
built with, tested on or calls at runtime ... No credential and no restricted content is in the product repository. Jobs
that need a resource run only where it is reachable, against the pinned state." No test file guards UC-040's flow
(`tests/*uc-040*` is empty; `tests/release-uc-037-connect-mailbox.test.mjs` is the known positive).

## Acceptance

- A system test through the frame's routes `resources` and `resources/instance` over a fake host and a fake Bridge: main
  flow steps 1-8 for a repository, a compute resource on a Bridge and one on a runner; 1b, 2c, 3a, 4a, 7a, 7b, 7c, 9a, 9b.
  It checks: one commit of `docs/resources.md` per *Save*; no secret value and no restricted content in any commit; the
  instance's list unchanged by a product's save, and the reverse; *Move* the only change of a pin.
- A release test of the same flow, written by a participant other than the implementer of ITM-642
  (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`). Counter-proof: a fault planted in the page's save fails it.
- Steps that wait on an item not built yet (ITM-1012 to ITM-1016) are left out and named in the test's header.
