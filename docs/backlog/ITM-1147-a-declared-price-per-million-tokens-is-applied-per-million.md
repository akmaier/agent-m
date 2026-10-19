---
id: ITM-1147
title: A participant's price per million tokens is applied per million
level: module
realises:
  - NO COST IS GUESSED
modules:
  - MOD-job-ledger
builds_on:
  - ITM-1136
tests:
  - unit
origin:
  - developer-sonnet-h's tests/test_job_cost.py (ITM-1136, pull request #1179, head b1e2aef9), finding P1
---
# ITM-1147 A participant's price per million tokens is applied per million

**REGISTER**

## Outcome

**A defect: a priced participant's cost is a million times too large.**
- MOD-participant-list.md:53 declares `Price` as "`<input> / <output> <currency> per million tokens`", and
  `participantsOf` reads it as `price: { input, output, currency }` (:70, :86-87).
- `jobCost` (`src/job-ledger/cost.mjs:19`) multiplies the reported tokens by those numbers directly, as if they were per
  token: `(usage.inputTokens ?? 0) * price.input + (usage.outputTokens ?? 0) * price.output`.
- So tokens at 3 / 15 USD per million show 33,000,000 USD where 33 USD is right.
- The unit test of `jobCost` hands it a price per token, so it never saw the units disagree.

The cost divides by a million, and the unit test hands the price as the register declares it.

## Acceptance

- TST-1136's case P1 passes, and its `expectedFailure` is removed by a participant other than this item's implementer.
  Counter-proof: a job whose runtime reports no usage still shows "unknown".
- The unit test of `jobCost` takes its price as `participantsOf` reads it from a register row.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
