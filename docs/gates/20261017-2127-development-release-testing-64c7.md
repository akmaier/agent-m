---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 681137faf5318e08f6babfe48b25f199e498ed3e
  - https://github.com/akmaier/agent-m/pull/782
date: 2026-10-17 21:27 UTC
---
# Development → Release testing: ITM-826, the main page reads the repository in batches

**REGISTER**

## Reason

ITM-826, pull request #782 into `sprint/team1/77`, at head `681137fa`. It is mergeable, and run 39070786110 passed ten of
ten.

**What holds.**
- **Red first.** The tests-only commit `18d72b70` was red in run 39070373404 on TST-826001, 002, 004 and 005 and the
  replaced TST-536015. TST-826003 states the count before the change and passes on the base, as it should. The code was
  pushed after the run had ended.
- **The decisions of `77.md` (21:10 UTC) are built.** Both scopes read ahead through `Snapshot.readMany`, the instance's
  files included. The scope `all` builds the six sources, and the rest of `Facts` stays `"unknown"` and is named in the
  pull request.
- **Counts with a token, at this repository's size:**
  - the scope `all`, which threw before, now takes 53 requests, against the old main page's 1,006;
  - the scope `work`, run before every hand-over, falls from 2,049 to 38.
  - Committed tests pin 19 and 15 on the fake of 600 items and 400 jobs.
- **Checks.** Four planted faults are caught. No release result changed, and ITM-018 passes.

**What is missing: one of the six sources is built and not tested.**
- The scope `all` reads the branch `test-results` (`src/progress-measures/facts.mjs:116-135`, `resultsBranch`).
- The tests' fake serves no such branch, so in every test `results` is `null`, the case where the repository has none.
- The case where the branch exists, which this item adds and which this repository's count shows (a commit and a tree of
  `test-results`), is asserted by no test.
- Sprint 62's agreement reads: "test every altered behaviour".

## What the rework does

- The tests' fake serves a `test-results` branch. A test asserts that `results` is that branch's snapshot, and the count
  includes its commit and tree.
- The test is written first and run red. The code needs no change unless the test shows a fault.
