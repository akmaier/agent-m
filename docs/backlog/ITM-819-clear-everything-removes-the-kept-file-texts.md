---
id: ITM-819
title: Clear everything removes the kept file texts
level: unit
realises:
  - A CLEAR IS A REAL CLEAR
  - UC-042
modules:
  - MOD-settings-pages
builds_on:
tests:
  - unit
origin:
  - ITM-810's draft stop (sprint team1/75), stop 1
---
# ITM-819 Clear everything removes the kept file texts

**REGISTER**

## Outcome

UC-042 reads: "**Clear everything in this browser** removes all of Agent M's entries from `localStorage`". The old
`token-clear` handler of `settings-view.mjs` also removed the file texts the app keeps, and `load-per-view.test.mjs`
asserts that of the old handler. The live `clearEverything` (`src/settings-pages/settings.mjs:394`) does not remove them.
This was read from the code, not run.

At the start, a unit test clicks the live *Clear everything* with kept file texts in the browser, and shows whether any of
Agent M's entries stay. If they stay, the live page removes them through the interface that keeps them, named at the
start from MOD-settings-pages' Uses. If no interface of its Uses reaches them, the item stops for a draft.

## Acceptance

- After the live *Clear everything*, no entry of Agent M is left in the browser, and the test pins it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
