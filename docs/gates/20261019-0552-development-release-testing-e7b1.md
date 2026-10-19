---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 490f1639666f1742cd72d95f59643bdfa756ff19
  - https://github.com/akmaier/agent-m/pull/948
date: 2026-10-19 05:52 UTC
---
# Development → Release testing: ITM-1000, item identifiers take three or more digits

**REGISTER**

## Reason

ITM-1000, pull request #948 into `sprint/team2/94`, passes on `490f1639`.
- The head is a plain merge of `be367db8`, which I pre-gated (comment on #948), with the sprint head `38a61696`, which
  holds ITM-958. Its tree equals the automatic merge of the two, so it adds no change of its own.
- CI is green on the head, on 20 of 20 jobs.

**The checks, from the pre-gate of `be367db8`:**
- The red first commit `b4921172` holds the tests and the item file.
- Only `docs/assets/work-items.mjs` and `flow.mjs`, the item file and four tests of MOD-work-plans changed.
- The item file matches the plan in team2/94.md.
- The accepted MOD-identifiers Data reads "`ITM-<nnn>`, three or more digits" (`f05cf0cd`).
- `byNumber` only orders ties within MOD-work-plans' rule that items stand after the items they build on.
- Replayed: the head's tests pass 81. On the sprint head's `docs/assets`, 9 fail. With a text sort put back,
  `test_backlog_layout` fails.
