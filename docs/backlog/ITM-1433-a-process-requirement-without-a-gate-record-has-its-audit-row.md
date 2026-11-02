---
id: ITM-1433
title: A process requirement without a gate record has its audit row
level: module
realises:
  - UC-030
  - THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE
modules:
  - MOD-trace-pages
builds_on:
  - ITM-775
tests:
  - unit
origin:
  - UC030-F6, TST-775220 of ITM-775's system tests of UC-030 (#1733), ruled at its gate in team1's sprint 142 (docs/gates/20261102-1108-development-release-testing-0775.md)
---
# ITM-1433 A process requirement without a gate record has its audit row

**REGISTER**

## Outcome

`THE AUDIT VIEW LISTS EVERY REQUIREMENT OF THE RELEASE`, "including requirements with no test or no passing outcome". The
audit view's `gatesOf` keeps only the gates that have a record, so a process requirement whose gate was never decided has
no row (TST-775220).

## Acceptance

- Every process requirement valid at the release has a row, one whose gate has no record included, naming that no record
  holds it.
- TST-775220 loses its `todo` in a commit by a participant other than the implementer, written after the code is pushed.
- No other existing expected result changes, unless a probe names it and the accepted text allows it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
