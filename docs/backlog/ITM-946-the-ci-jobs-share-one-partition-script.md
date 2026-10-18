---
id: ITM-946
title: The CI jobs share one partition script
level: unit
realises:
  - A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
modules:
  - MOD-test-schedule
builds_on:
  - ITM-945
tests:
  - unit
origin:
  - developer-sonnet-a's finding on ITM-945's pull request #913 (sprint team1/91)
---
# ITM-946 The CI jobs share one partition script

**REGISTER**

## Outcome

The python job of `.github/workflows/tests.yml` (`:36-57`) carries an inline copy of the node job's partition script
(`:80-98`). Since ITM-945 the node copy keeps the files that start Electron apart, and the python copy does not. It needs no
such rule, but the two copies now differ, and a change to one does not reach the other.

One script for both jobs would need a file that MOD-test-schedule's Parts do not name today (MOD-test-schedule.md:70 names
the two workflow files). So the item begins with a draft of MOD-test-schedule.md for akmaier, naming that file. It waits for
that draft.

## Acceptance

- Both jobs run one partition script, named in MOD-test-schedule's Parts, and give the same partition as today for their
  own files. A test compares the shards before and after, with a counter-proof.
- The first commit holds only the tests. No stub is committed.
