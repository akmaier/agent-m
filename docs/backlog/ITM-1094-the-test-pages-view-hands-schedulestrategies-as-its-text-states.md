---
id: ITM-1094
title: The test pages' view hands scheduleStrategies, as its text states
level: module
realises:
  - UC-027
modules:
  - MOD-test-pages
builds_on:
  - ITM-1083
tests:
  - unit
origin:
  - the gate of #1107 (ITM-1083), sprint team2/97, on main at 45f37441
---
# ITM-1094 The test pages' view hands scheduleStrategies, as its text states

**REGISTER**

## Outcome

MOD-test-pages.md:104-105: the `view` hands "`scheduleStrategies`, `resultStrategies`, `routeStrategies`, `approvalStrategies`,
`sourceStrategies`, `resourceStrategies`". After ITM-1083, `src/test-pages/index.mjs` hands all of them but `scheduleStrategies`,
the writer `ci-configuration` of the kind `set-up-ci`. ITM-1083 left it out, since its Acceptance named only the other two.

## Acceptance

- A unit test naming MOD-test-pages registers only the test pages' view, and finds the writer `ci-configuration` registered.
- Counter-proof: `scheduleStrategies` removed from `view.strategies` fails it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-pages/index.mjs` and the tests that name MOD-test-pages change.
