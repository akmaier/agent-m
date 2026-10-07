---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 9078f6d18b70558e4a5c1895e24d5de0ef665526
  - https://github.com/akmaier/agent-m/pull/151
date: 2026-10-07 08:20 UTC
---
# Development → Release testing: ITM-209

**REGISTER**

## Reason

ITM-209, the backlog's order read as the table MOD-work-plans states: pull request #151 by developer-sonnet-a, on head
`9078f6d`, branched from `sprint/07` at `aed8a49`. What holds:
- The first commit, `a761e71`, holds only `tests/work-plans-backlog-order.test.mjs`, and CI was red on it: that file
  failed, since `src/work-plans/` did not exist yet.
- CI is green on the head (python and node).
- Only `src/work-plans/index.mjs` and `backlog-order.schema.md`, among the module's Parts, and the new test, whose header
  names MOD-work-plans, changed. MOD-documents and MOD-text-tools needed no part that is not built, so neither changed.
- The three new tests name their requirements and MOD-work-plans, and each has its counter-proof recorded.
- The schema reads the table `Item` under `## Order`, and a row whose cell is no `ITM` identifier is a finding of that row.

Why it is rejected: check 5, the Acceptance, does not hold for its third statement, that the order of this repository's
own backlog is read as the items of its table, in their order.
- The test states a fixed list of the 40 items the order holds today, not the items of its table.
- So it fails as soon as `docs/backlog/order.md` gains a row, though the order is still read right. Checked on the head:
  with one row added, the reader returns it and the test fails.
- That file is a register the Product Owner changes on `main`: the review at a sprint's close adds its feedback as items,
  as `c40c487` did at sprint 06's close, and UC-032's *Save order* writes it. The closing pull request of this sprint would
  then be red.

The item is not done; the review at the sprint's end decides what needs more work in the next sprint.
