---
id: ITM-591
title: A source gets a new version in the library, and a product moves to it
level: module
realises:
  - UC-016
  - UC-004
modules:
  - MOD-settings-pages
builds_on:
  - ITM-589
tests:
  - unit
  - system
  - release
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-591 A source gets a new version in the library, and a product moves to it

**REGISTER**

## Outcome

UC-016 steps 1, 3, 4 and 5, with 4a and 1a, on the page; its second postcondition; and UC-004 1a: "offers to add a new version instead". `versionCommits` and `SameBytes` are built (ITM-385). The page part is not (`src/settings-pages/library.mjs:3-4`).

## Acceptance

- *+ New version* is refused when its bytes equal an existing version's.
- The products still on older versions are shown.
- *Move* lists the affected requirements and the changed passages, then commits `docs/sources.md` with a message that names those requirements.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
