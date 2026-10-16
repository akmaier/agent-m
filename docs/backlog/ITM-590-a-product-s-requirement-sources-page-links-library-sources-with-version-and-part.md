---
id: ITM-590
title: A product's Requirement sources page links library sources with version and part
level: module
realises:
  - UC-015
  - EVERY STEP EXPLAINS ITSELF
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
# ITM-590 A product's Requirement sources page links library sources with version and part

**REGISTER**

## Outcome

UC-015 steps 1 to 4, with 2a, 2b, 2c and 3a. MOD-settings-pages' route `sources` is not built. The format of the links file is built (ITM-228).

## Acceptance

- Ticking sources, choosing a version and a part, and pressing *Save* write `docs/sources.md` in one commit.
- Before a link is removed, the requirements that name its source are listed.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
