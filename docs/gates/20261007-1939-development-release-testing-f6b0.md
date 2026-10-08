---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 0a9b95c56bc3b41263e2e59eebfcf570de154e7b
  - https://github.com/akmaier/agent-m/pull/198
date: 2026-10-07 19:39 UTC
---
# Development → Release testing: ITM-209, its rework within sprint 12

**REGISTER**

## Reason

ITM-209, the backlog's order read as the table MOD-work-plans states: pull request #198 by developer-sonnet-a, reworked
once within the sprint on the condition of its rejection on `f720d2a` (`20261007-1930-…-2d95.md`). It is now on head
`0a9b95c`, branched from `sprint/12` at `ba14e4d`.
- The first commit, `9275f40`, holds only `tests/work-plans-backlog-order.test.mjs`, and CI was red on it (run
  37673326298). The node job failed on exactly that file, whose module did not exist yet, beside the suite's known todo
  marks.
- CI is green on the head (run 37675858841): node 912 tests, 0 fail, 11 todo; python 396, OK.
- Only `src/work-plans/index.mjs` and `backlog-order.schema.md`, among the module's Parts, and the new test, whose header
  names MOD-work-plans, changed. The rework, `0a9b95c`, changes only that test.
- The three new tests name what they guard and the module, and their counter-proofs are recorded. Run on the head with
  the fault planted: the column renamed turns all three red, and so does the table looked for under another heading.
- The Acceptance holds:
  - an order is read as its items in the table's order;
  - a row whose cell is no item's identifier is a finding of that row;
  - this repository's own order is read as the items of its table, whatever rows it holds.
- The condition of the rejection is met: the known positive reads a synthetic table. Run on the head, the test stays
  green with the row ITM-209 removed from `docs/backlog/order.md`, and with a row added and the first ten removed.
