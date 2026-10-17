---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 618e1144a954b27df26d5d9698bbeb99f2833d86
  - https://github.com/akmaier/agent-m/pull/809
date: 2026-10-17 23:05 UTC
---
# Development → Release testing: ITM-760, the runs of a commit, per level and per test

**REGISTER**

## Reason

ITM-760 as narrowed (fc24d87d), pull request #809 into `sprint/team2/82`, at head `618e1144`.
- The first commit, `dec197af`, holds only `tests/test-pages-runs.test.mjs`, and CI is red on it (node (1)). CI is
  green on `618e1144` in all 12 jobs.
- The changes are `src/test-pages/runs.mjs` and `src/test-pages/index.mjs` (MOD-test-pages), and the new test file,
  whose header names MOD-test-pages.
- TST-760001 to TST-760010 name level, module and what they guard. Their counter-proofs are in the PR description.

**Counter-proofs replayed in a checkout of the head; each failed and was restored.**
- TST-760003, every level counted as run: 2 tests fail. A level without a record never reads *passed*.
- TST-760007, a missing log shown as empty, failed. So did TST-760009, the secrets page linked instead of `actions`.

**Readings accepted.**
- `readDocument` is used instead of `readRegister`, because `readRegister(resultSchema.run)` throws on two tables. The
  known positive: `readRegister(scheduleSchema)` reads its rows. MOD-test-pages' Uses names neither `readDocument` nor
  `isTestFile`; this module-file gap goes to the review.
- The log's run id is the end of the record's `run` address, taken when `webLinks().run(id)` gives the address back.
  No test fails when that check is dropped.
- The last release is the highest `v<major>.<minor>.<patch>` tag.
- Occasions come from `docs/tests/schedule.md` at the commit, else from the book's default.
- There is no *What is this?* fold, as sprint 82 records. A level with no declared tests gets no line.
