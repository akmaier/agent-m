---
id: ITM-1217
title: Agent M's own test command and setup
level: module
realises:
  - THE TEST SCHEDULE IS DECLARED PER PRODUCT
  - A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
  - UC-027
modules:
  - MOD-test-schedule
builds_on:
  - ITM-1213
tests:
  - unit
origin:
  - ITM-476, split after akmaier accepted MOD-test-schedule on 2026-10-26 (33f3ab1b)
---
# ITM-1217 Agent M's own test command and setup

**REGISTER**

## Outcome

The test helpers under `tests/` that MOD-test-schedule.md names as Agent M's own `command` and `setup`, their headers
naming MOD-test-schedule:

- the command runs the Python and the node suite of the files it is given into one JUnit XML report at
  `AGENT_M_REPORT`, draws shard `AGENT_M_SHARD` of `AGENT_M_SHARDS`, keeps the test files that start Electron in shards
  of their own, and ends non-zero when a test failed;
- the setup installs xvfb and openbox and the Bridge app's packages.

What `.github/workflows/tests.yml` and `nightly.yml` do that is Agent M's alone moves here, and no line into the
generator.

## Acceptance

- Unit tests naming MOD-test-schedule: over fixture files, every file lands in exactly one shard across all shards; no
  shard holds an Electron file with another file; a failing fixture test gives a non-zero exit and a `failed` case in
  the one report; Python and node cases share that report.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only the new helpers under `tests/` and the tests that name MOD-test-schedule change.
