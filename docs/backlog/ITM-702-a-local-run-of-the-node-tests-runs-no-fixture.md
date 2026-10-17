---
id: ITM-702
title: A local run of the node tests runs no file of the groups fixture
level: module
realises:
  - A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
modules:
  - MOD-group-document
builds_on:
tests:
  - unit
origin:
  - ITM-628's gate on pull request #719 (docs/gates/20261017-1016-development-release-testing-8f15.md), from developer-sonnet-e's finding
---
# ITM-702 A local run of the node tests runs no file of the groups fixture

**REGISTER**

## Outcome

`node --test tests/` runs every `*.test.js` below `tests/`, so it also runs
`tests/fixtures/groups/repo/tests/export.test.js`, which is a fixture product's file, read by
`tests/artifacts-checks.test.mjs` and `tests/test_groups.py`, and not a test of Agent M. CI picks its files by list and
does not run it. The fixture's file keeps its contents and stops being matched as a test of this repository: either
it is renamed, with its readers reading the new name, or the readers build it. Which is read at the start against the
two readers.

## Acceptance

- `node --test tests/` runs no file below `tests/fixtures/groups/`, and both readers find the fixture as before.
- It is declared as refactoring: CI is green on every commit.

The architecture fixture's `tests/fixtures/architecture/tests/reader.test.js` is not this item's: its readers are tests
of other modules. It is ITM-820's.
