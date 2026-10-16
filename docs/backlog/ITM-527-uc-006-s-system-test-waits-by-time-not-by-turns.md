---
id: ITM-527
title: UC-006's system test waits by time, not by turns
level: system
realises:
  - UC-006
modules:
  - MOD-review-pages
builds_on:
tests:
  - system
origin:
  - the gate of #560 (ITM-526, sprint team1/37): TST-371001 failed once on CI with "waited for acceptance result" and passed on its re-run; TST-371003 failed so in sprint 33
---
# ITM-527 UC-006's system test waits by time, not by turns

**REGISTER**

## Outcome

`tests/system-uc-006-approve-spec-change.test.mjs` waits for what the review page writes by time, not by a count of turns,
as ITM-467 made ITM-357's test wait.
- Its helper `until()` polls the condition, yielding with `setImmediate` between polls, for at most ten seconds, and fails
  naming what it waited for, as before.
- Today it gives up after 500 turns, which the page's acceptance outlasts when the whole suite runs under load. So
  TST-371001 (#560) and TST-371003 (sprint 33) each failed once on CI, though nothing they assert had changed.

It changes how the test waits, nothing it expects, and no file of `src/`.

The value its Acceptance needs that no file states, and what is built: a limit of ten seconds, five times ITM-467's two,
because a system test runs the whole acceptance through a fake host.

## Acceptance

- Only `until()` in `tests/system-uc-006-approve-spec-change.test.mjs` changes; no expected result changes, and no other
  file.
- A counter-proof recorded in the pull request: with a condition that never holds, `until()` fails naming what it waited
  for, within its time limit.
- CI is green on the item's head. Since the item adds no behaviour, its first commit need not be red.
- The other test files that wait by a count of turns are named in the pull request for the review, and not changed:
  `tests/bridge-jobs-agents.test.mjs`, `tests/bridge-jobs-endpoint-ask.test.mjs`,
  `tests/review-pages-architecture.test.mjs`, `tests/review-pages-review-all.test.mjs`,
  `tests/review-pages-use-cases.test.mjs` and `tests/review-pages-whole-architecture.test.mjs`.
