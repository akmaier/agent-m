---
id: ITM-1020
title: The stand-in window tests of the wait helper hold under CI's load
level: unit
realises:
  - A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
modules:
  - MOD-site-frame
builds_on:
  - ITM-938
tests:
  - unit
origin:
  - ITM-352's run 39206021890, node (7), job 117908930230 (sprint team1/93)
---
# ITM-1020 The stand-in window tests of the wait helper hold under CI's load

**REGISTER**

## Outcome

TST-938007 (`tests/site-usability-wait-error.test.mjs`, a stand-in shell child that serves no page) timed out at 30 s
once on CI and passed on its rerun, outside the item under test.

**First task:** read the job's log and name what the 30 s waited for. No change comes before it is named.

## Acceptance

- TST-938007 passes in ten runs beside the full node suite, and a planted delay beyond its bound fails it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
