---
id: ITM-653
title: The bridge-jobs tests hold under load
level: module
realises:
  - A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
modules:
  - MOD-bridge-jobs
builds_on:
tests:
  - unit
origin:
  - ITM-598's gate on pull request #697 (docs/gates/20261017-0634-development-release-testing-3c18.md)
---
# ITM-653 The bridge-jobs tests hold under load

**REGISTER**

## Outcome

Two gates of sprint 66 saw tests of `tests/bridge-jobs-*.test.mjs` fail only while other suites ran beside them:
- `tests/bridge-jobs-agents.test.mjs` failed 4 in one concurrent run (ITM-640's gate);
- `bridge-jobs-endpoint-ask` failed under load (ITM-598's gate).

Each passes alone and on CI. Both name `Module: MOD-bridge-jobs`. What their waits count is read at the start.

## Acceptance

- Each of those tests passes in ten runs beside the full node suite, with no change to its expected results.
- A wait bounded by time is shown by a planted delay beyond its bound, which fails it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
