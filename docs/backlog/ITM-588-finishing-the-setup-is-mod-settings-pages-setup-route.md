---
id: ITM-588
title: Finishing the setup is MOD-settings-pages' setup route
level: module
realises:
  - UC-014
modules:
  - MOD-settings-pages
  - MOD-site-frame
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

**The readings, settled at sprint team1/56 for sprint 57:**
- **Who changes what.**
  - The item, an implementation job, builds the route `setup` in MOD-settings-pages' part `setup.mjs`, as its file
    states it: "then *Finish setting up*: the prefilled token page, *Only select repositories* and the instance named,
    the shared-origin notice with its tick, the token and its expiry, *Store and check*, and *Import settings* beside
    it". It changes no file under `docs/assets/`.
  - Afterwards, a pull request between jobs makes the live page's `#setup` call the module's route in place of
    `docs/assets/dashboard/setup-view.mjs`, and removes that file. Those are the forms of
    `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS` that make "old code call a module in place of its own code" and remove
    "what a module now provides".
- **The tests.**
  - TST-474029 to TST-474032 (`tests/dashboard-review-flows.test.mjs:738-802`) run the live app, `docs/assets/dashboard-app.mjs`,
    in `tests/app-harness.mjs`. They stay unchanged and keep passing through the between-jobs change, which is their
    use.
  - The item's own tests render the module's route in a small DOM, as the other `tests/settings-pages-*.test.mjs` do.
    They state the same behaviour in their own words.
- **The explanations** of Step A and Step B are topics of MOD-site-frame's `explanations.md`, from UC-014 step 7, called
  with `explain` as the module's other routes call it. No folded explanation is built in `setup.mjs` (gate of #654).
- **Reachable through the real host.** *Store and check* reads the instance's repository with the token through
  MOD-repository-hosts, as the live page does today.

## Acceptance

- `src/settings-pages/setup.mjs` gives *Finish setting up* as the module file states it.
- TST-474029 to TST-474032 stay unchanged and pass.
- Afterwards a pull request between jobs makes the live page call it in place of its own code (SPEC.md, `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS`).
- The first commit holds only the tests, and CI is red on it. No stub is committed.
