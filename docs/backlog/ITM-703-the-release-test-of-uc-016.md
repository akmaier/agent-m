---
id: ITM-703
title: The release test of UC-016
level: system
realises:
  - UC-016
modules:
  - MOD-settings-pages
builds_on:
  - ITM-591
tests:
  - release
origin:
  - the start of sprint team1/71 (docs/backlog/sprints/team1/71.md), under sprint 68's agreement on release tests
---
# ITM-703 The release test of UC-016

**REGISTER**

## Outcome

ITM-591 builds UC-016 on MOD-settings-pages' `library/<source>`, and lists the release level, which its developer does
not write (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`). This item is that test, written by another participant
in the pattern of ITM-639. It walks the use case through MOD-site-frame's route `library`:
- *+ New version* with its refusal for equal bytes;
- the products on older versions;
- *Move*, with the affected requirements and the changed passages, and its commit.

## Acceptance

- A release test, written by a participant other than ITM-591's developer, guards UC-016's main flow, 1a and 4a through
  the frame's route.
- Its counter-proof plants a fault in `library.mjs` and fails.
