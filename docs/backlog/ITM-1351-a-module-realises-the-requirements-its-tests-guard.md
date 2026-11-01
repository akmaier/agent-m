---
id: ITM-1351
title: A module's row realises the requirements its tests guard
level: module
realises:
  - UC-025
  - MODULE GAPS ARE REPORTED, NOT FORBIDDEN
modules:
  - MOD-trace-graph
builds_on:
  - ITM-741
tests:
  - unit
origin:
  - finding UC025-F2 of ITM-741's system test TST-741003 (#1607), ruled at its gate in team1's sprint 141 (docs/gates/20261101-0613-development-release-testing-0741.md)
---
# ITM-1351 A module's row realises the requirements its tests guard

**REGISTER**

## Outcome

UC-025 step 3: a module's row **realises** "the requirements its tests guard". Step 4 gives two gaps: "a module that
realises no requirement: no test of it guards one" and "an accepted requirement that no module realises: no test of a
module guards it". `moduleRows` (`src/trace-graph/derive.mjs:250`) takes *realises* from the module file's own `realises`
instead. So a module whose tests guard nothing shows a requirement and no gap. A requirement that a module's test guards
also stays a gap. MOD-trace-graph.md:267 gives `moduleRows` as "one row per module, as UC-025 shows it", and
MOD-trace-pages.md:134 as "the requirements its tests guard".

## Acceptance

- A row's *realises* is the set of requirements that the tests exercising the module guard, each with its status.
- The two gaps of step 4 follow from that set.
- TST-741003 loses its `todo` in a commit by a participant other than the implementer, written after the code is pushed.
- No other existing expected result changes, unless a probe names it and the accepted text allows it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
