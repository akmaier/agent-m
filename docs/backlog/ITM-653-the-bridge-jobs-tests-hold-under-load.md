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

**A cause verified at ITM-880's gate (sprint team2/89, 2026-10-18, po-opus-b).** CI attempt 1 of #869 (run 39113690873,
job 117634976800, on `70659ded`) failed TST-472080 in `tests/bridge-jobs-agents.test.mjs`. The error was "ENOTEMPTY:
directory not empty, rmdir '/tmp/agent-m-326-QlrxLo'", raised from `onComputer`'s `finally` (`:63`), `rmSync(machine.root,
{ recursive: true, force: true })`. The path:
- The test's last steps (`:170-173`) post a second ask ("Draft again.") and never wait for it to end.
- Its fixture `opencode` (`:53`) first appends a line to `<root>/calls`. The gate file exists by then, so it answers at
  once.
- `onComputer` removes `<root>` while that process can still write `calls`. A file written while the folder is being
  removed leaves the folder not empty.

Verified with a scratch copy of the test that, in `finally`, counts the lines of `calls` before and 500 ms after the test
returned: 3 lines, then 4. The fourth is the second ask's agent, still running after the test had returned. Forty plain
runs of the test on a quiet machine all passed, so the race shows only under load. The test is to wait for every ask it
started before its folder is removed. No expected result changes.
