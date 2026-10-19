---
id: ITM-1011
title: The library's one-click commit test hashes an input that does not change between runs
level: unit
realises:
  - A TEST THAT FLIPS ON THE SAME COMMIT IS FLAKY
modules:
  - MOD-settings-pages
builds_on:
tests:
  - unit
origin:
  - ITM-999's run 39166166131, node (15), job 117789427897 (sprint team1/92)
---
# ITM-1011 The library's one-click commit test hashes an input that does not change between runs

**REGISTER**

## Outcome

`tests/settings-pages-library.test.mjs:237` ("documents that may be republished are committed … by one click") failed once
with a hash mismatch in a `deepEqual` and passed on its rerun. A hash that differs between runs points to an input that is
not fixed, such as a date or an order.

**First task:** name the input of the hash that differs between runs. No change comes before it is named.

## Acceptance

- The test's input is fixed, and the test passes in ten runs beside the full node suite with no expected result changed.
  A planted varying input, such as the current date, fails it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
