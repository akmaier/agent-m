---
id: ITM-1431
title: A process requirement's audit row names the artifacts its gate added
level: module
realises:
  - UC-030
  - A PROCESS REQUIREMENT ADDS TO THE MODEL
modules:
  - MOD-release-evidence
builds_on:
  - ITM-775
tests:
  - unit
origin:
  - UC030-F5, TST-775204 of ITM-775's system tests of UC-030 (#1733), ruled at its gate in team1's sprint 142 (docs/gates/20261102-1108-development-release-testing-0775.md)
---
# ITM-1431 A process requirement's audit row names the artifacts its gate added

**REGISTER**

## Outcome

A process requirement adds artifacts or gates to the model (`A PROCESS REQUIREMENT ADDS TO THE MODEL`). The audit's row
of such a requirement names the gate records only, not the artifacts the gate asked for (TST-775204).

## Acceptance

- The audit's row of a process requirement names the artifacts its gate asked for and the gate record that holds them.
- TST-775204 loses its `todo` in a commit by a participant other than the implementer, written after the code is pushed.
- No other existing expected result changes, unless a probe names it and the accepted text allows it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
