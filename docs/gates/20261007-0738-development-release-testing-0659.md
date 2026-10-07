---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 14e7b93bbdb5a8219e700cf0b7402c66edae7a3e
  - https://github.com/akmaier/agent-m/pull/145
date: 2026-10-07 07:38 UTC
---
# Development → Release testing: ITM-225

**REGISTER**

## Reason

ITM-225, a date is history only as the date of a change: pull request #145 by developer-sonnet-a, on head `14e7b93`,
branched from `sprint/07` at `b7e6cc4`.
- The first commit, `247c220`, holds only `tests/text-tools.test.mjs`, and CI was red on it: the new no-mark test failed,
  and so did ITM-212's two tests of `MARKED`, whose expected result the item changes.
- CI is green on the head (python and node).
- Only the item's scope changed: `src/text-tools/history-marks.mjs`, and `tests/text-tools.test.mjs`, an existing test
  whose header names MOD-text-tools. `AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES` allows tests that name one of the
  job's modules, not only new files, and the item asks ITM-212's expected result to change there. The one expected result
  that changed, line 15's retrieval date, is the one the item names, and the pull request names it.
- The two new tests name `A DOCUMENT HOLDS NO HISTORY` and MOD-text-tools, and each has its counter-proof recorded in the
  pull request.
- The Acceptance holds: the three forms of a date of a change are marked `dated-change`; a retrieval date, a version's, a
  release's, a measurement's and a table cell's date are no mark; withdrawals and edit stamps stay marked.

Noted for the sprint's end, no reason by itself: the comment of `historyMarks` at `history-marks.mjs:58-60` still calls a
stated date a mark; and an attribution is recognised only after `PO`, as in the module file's examples.
