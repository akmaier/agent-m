---
id: ITM-1430
title: The audit shows whether a model-dependent test reached its rate
level: module
realises:
  - UC-030
  - A MODEL-DEPENDENT TEST IS MEASURED AS A RATE
modules:
  - MOD-release-evidence
builds_on:
  - ITM-775
tests:
  - unit
origin:
  - UC030-F1, TST-775207 of ITM-775's system tests of UC-030 (#1733), ruled at its gate in team1's sprint 142 (docs/gates/20261102-1108-development-release-testing-0775.md)
---
# ITM-1430 The audit shows whether a model-dependent test reached its rate

**REGISTER**

## Outcome

A model-dependent test's outcome is a rate (`A MODEL-DEPENDENT TEST IS MEASURED AS A RATE`). The audit's rows that
MOD-release-evidence derives give that rate alone, so the reader cannot tell whether the test passed on the release
(TST-775207).

## Acceptance

- The audit's row of a model-dependent test names its rate, the rate of the last release it is compared with, and whether
  it passed.
- TST-775207 loses its `todo` in a commit by a participant other than the implementer, written after the code is pushed.
- No other existing expected result changes, unless a probe names it and the accepted text allows it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
