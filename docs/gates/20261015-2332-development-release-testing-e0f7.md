---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 014b6ced0b53a0d0bd3127bc19a1444a87a94e07
  - https://github.com/akmaier/agent-m/pull/532
date: 2026-10-15 23:32 UTC
---
# Development → Release testing: ITM-490, A job record says that its task travels with its hand-over

**REGISTER**

## Reason

ITM-490, pull request #532 into `sprint/team1/30`, head `014b6ced`. developer-sonnet-a made both commits.

1. The tests-only commit `b8183a56` holds only `tests/job-ledger-task.test.mjs`, and CI was red on it (run
   38822277714, node (1)).
2. CI is green on the head, ten of ten jobs (run 38822756954). Locally, 23 test files that use or name MOD-job-ledger,
   among them the release tests of UC-010, UC-011, UC-017 and UC-019, give 280 passing tests and 1 failing. The failing
   one is `tests/review-pages-whole-architecture.test.mjs` (`localStorage` on Node 23), and it fails the same way
   without the change. UC-049 has no release test.
3. The changes stay in the item's scope: `src/job-ledger/index.mjs` and `src/job-ledger/job.schema.md` are the item's
   module, and the new test file names MOD-job-ledger. No existing test changed, as the item states.
4. TST-490001 to TST-490004 name their requirements and MOD-job-ledger, and state their values in their own text.
   Their counter-proofs are recorded in #532.
5. The Acceptance holds:
   - A start of each kind is written and read back with `task` and `conversation`.
   - An earlier record without them reads as `in parameters` with no conversation.
   - A message planted in the parameters of a hand-over record is found.
