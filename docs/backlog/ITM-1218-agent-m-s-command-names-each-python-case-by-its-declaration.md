---
id: ITM-1218
title: Agent M's test command names each Python case by its declaration
level: module
realises:
  - EVERY TEST RUN LEAVES A RESULT RECORD
  - UC-027
  - UC-028
modules:
  - MOD-test-schedule
builds_on:
  - ITM-1217
  - ITM-1212
tests:
  - unit
origin:
  - ITM-1217's report (PR #1336): Python cases reach the report under their method's name, so parseOutcomes reads them `undeclared`
---
# ITM-1218 Agent M's test command names each Python case by its declaration

**REGISTER**

## Outcome

MOD-result-records matches a test case to its declaration by the `TST-<nnn>` at the start of the case's name
(MOD-result-records.md, *The outcome input*). Agent M's Python tests declare their identifier in the comment block
before each test method (`# TST-475001 · level: component · …`, as MOD-test-document's `testDeclarations` reads it), but
Agent M's command (`tests/test-schedule-command.d/unittest_junit.py:61`) names each `<testcase>` by its method alone. Every
Python outcome of a run is therefore `undeclared`, and every declared Python test `not run`.

The command names a Python case `TST-<nnn> <method>` where the method's declaration names one, and by its method as now
where none does, so that the run's record holds the Python tests' real outcomes.

## Acceptance

- Unit tests naming MOD-test-schedule: over a fixture Python test file with a declared and an undeclared method, the
  report names the declared case starting with its `TST-<nnn>` and the other by its method; `parseOutcomes` reads the
  declared one `passed` or `failed`, not `undeclared`. Counter-proof: without the change it is `undeclared`.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only Agent M's command under `tests/` and the tests that name MOD-test-schedule change.
