---
id: ITM-1148
title: A cost an endpoint reports reaches the job's record from the tab
level: module
realises:
  - NO COST IS GUESSED
modules:
  - MOD-runtimes
builds_on:
  - ITM-1136
tests:
  - unit
origin:
  - developer-sonnet-h's tests/test_job_cost.py (ITM-1136, pull request #1179, head b1e2aef9), finding P2
---
# ITM-1148 A cost an endpoint reports reaches the job's record from the tab

**REGISTER**

## Outcome

SPEC.md:1812: "A job shows a cost only when its runtime reports one, or when the runtime reports usage and the participant
declares a price for it." `usageOf` in `src/runtimes/tab.mjs:50-55` sums each exchange's tokens and sets `cost: null`, so
a cost an exchange reports never reaches `jobCost` (`src/job-ledger/cost.mjs`). It is latent while no endpoint reports a
cost. First read whether MOD-endpoint-calls' exchange states a reported cost. If it does, `usageOf` sums it as it sums
the tokens; if it does not, stop and name the gap.

## Acceptance

- TST-1136's case P2 passes, and its `expectedFailure` is removed by a participant other than this item's implementer.
  Counter-proof: exchanges that report no cost leave `cost` null.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
