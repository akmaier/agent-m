---
id: ITM-467
title: ITM-357's test waits by time, not by turns
level: module
realises:
  - UC-006
  - A PULL REQUEST'S CI RUNS WITHIN TWO MINUTES
modules:
  - MOD-review-pages
builds_on:
  - ITM-357
tests:
  - unit
origin:
  - the increment of sprint team1/23, #460, its node CI red on tests/review-pages-spec-entries.test.mjs
  - UC-041 7a
---
# ITM-467 ITM-357's test waits by time, not by turns

**REGISTER**

## Outcome

`tests/review-pages-spec-entries.test.mjs`, ITM-357's test of MOD-review-pages, waits for what the page writes by time,
not by a count of turns: its helper `until()` polls the condition, yielding with `setImmediate` between polls, for at
most two seconds, and fails naming what it waited for, as before. Today it gives up after 400 turns, which the page's
write outlasts when the whole suite runs under load, so the increment of sprint team1/23 (#460) was red although
ITM-357's own head was green. It changes how the test waits, nothing it expects, and no file of `src/`. Its pull request
goes into `sprint/team1/23`, whose increment is not merged until its CI is green (UC-041 7a, 7b).

## Acceptance

- Only `until()` in `tests/review-pages-spec-entries.test.mjs` changes; no expected result changes, and no other file.
- A counter-proof recorded in the pull request: with a condition that never holds, `until()` fails naming what it waited
  for, within its time limit.
- CI is green on the item's head, and the node job of #460 is green when run again on `sprint/team1/23` with it merged.
- Since the item adds no behaviour, its first commit need not be red.
