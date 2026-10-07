---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - f720d2a1528074d6cca2ac438f1975ff8bdd7a56
  - https://github.com/akmaier/agent-m/pull/198
date: 2026-10-07 19:30 UTC
---
# Development → Release testing: ITM-209, its second attempt

**REGISTER**

## Reason

ITM-209, the backlog's order read as the table MOD-work-plans states: pull request #198 by developer-sonnet-a, on head
`f720d2a`, branched from `sprint/12` at `ba14e4d`. What holds:
- The first commit, `9275f40`, holds only `tests/work-plans-backlog-order.test.mjs`, and CI was red on it (run
  37673326298). The node job failed on exactly that file, whose module did not exist yet, beside the suite's known todo
  marks.
- CI is green on the head (run 37673814150): node 908 tests, 0 fail, 11 todo; python 396, OK.
- Only `src/work-plans/index.mjs` and `backlog-order.schema.md`, among the module's Parts, and the new test, whose header
  names MOD-work-plans, changed. MOD-documents and MOD-text-tools needed no part that is not built.
- The three new tests name what they guard and the module. The two recorded counter-proofs turn them red when planted
  on the head: the column renamed, all three; the column typed as text, the second.
- An order is read as its items in the table's order, and a row whose cell is no item's identifier is a finding of that
  row.

Why it is rejected: check 5, the Acceptance's third statement, does not hold. That statement asks that this
repository's own order be read as the items of its table "whatever rows it holds".
- The test first asserts that the order holds ITM-209, as its known positive.
- Run on the head with that row removed from `docs/backlog/order.md`, the test fails on that assertion. Yet the order is
  still read right: 68 rows read, as the table holds them, in their order.
- The order is a register that its Product Owners change, and UC-032's *Save order* writes it. Today alone, this
  sprint's start decision moved three of its rows, and sprint 09 added ITM-272.

The item is not done. Its developer may rework it once within the sprint, on exactly this condition (`docs/process.md`,
Sprint).
