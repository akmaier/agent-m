---
id: ITM-588
title: Finishing the setup is MOD-settings-pages' setup route
level: module
realises:
  - UC-014
modules:
  - MOD-settings-pages
builds_on:
tests:
  - unit
  - release
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-588 Finishing the setup is MOD-settings-pages' setup route

**REGISTER**

## Outcome

UC-014 steps 6 to 8 and 7a run today in `docs/assets/dashboard/setup-view.mjs`, code no module owns. Yet TST-474029 to TST-474032 name MOD-settings-pages. MOD-settings-pages describes the route `setup` and its part `setup.mjs`.

## Acceptance

- `src/settings-pages/setup.mjs` gives *Finish setting up* as the module file states it.
- The existing tests pass unchanged against it.
- Afterwards a pull request between jobs makes the live page call it in place of its own code (SPEC.md, `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS`).
- The first commit holds only the tests, and CI is red on it. No stub is committed.
