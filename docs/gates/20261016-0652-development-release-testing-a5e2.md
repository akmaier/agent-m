---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - ba6ca2df0c334c9693e930e61604d0fe44f9ff5e
  - https://github.com/akmaier/agent-m/pull/553
date: 2026-10-16 06:52 UTC
---
# Development → Release testing: ITM-493, A tab job's context, and a job in the tab without a record

**REGISTER**

## Reason

ITM-493, pull request #553 into `sprint/team1/34`, at head `ba6ca2df`. developer-sonnet-c made the three commits.

1. **The red commit.** The tests-only commit `88b0a8c6` holds only `tests/runtimes-tab-context.test.mjs`, and CI was red
   on it (run 38863365768). Run once locally against an uncommitted stub, all five tests fail on behaviour.
   - The next commit, `f03fa2c9`, also tests-only, makes the test's spy host answer no `then`, so that awaiting it does
     not treat it as a promise. That changes only how the test prepares its fixture.
   - It was added on top, and no pushed commit was rewritten.
2. **CI is green on the head**: ten of ten jobs, run 38863442245. The pull request is mergeable.
   - Locally, 164 tests of MOD-runtimes and its callers pass.
   - TST-367001 to TST-367003 fail, which are among the known local desktop failures.
3. **The changes stay in the item's scope.** `src/runtimes/tab.mjs` and `index.mjs` are the item's module, and the new
   test file names it. No existing test changed, and no caller changed: the item names none.
4. **The new tests.** TST-493001 to TST-493005 name their requirements and MOD-runtimes, and state their values in their
   own text. The counter-proofs are recorded in #553.
5. **The Acceptance holds.**
   - `tabContext` gives the context with `instance.checkout` `null`, making no request.
   - `connect(address)` gives the given product's or instance's host, and `null` for other addresses, as the start
     decision named.
   - `runOnTab` with `record: null` runs attended, appends nothing and asks the host nothing. With a record, it runs as
     before.

**The developer's reading, confirmed.** The module file never states the instance's address, and the start decision
named `connect` only by "the instance's address". The developer took `instance.snapshot.repository.web`. That is the
same form as the product's `address`, which `src/review-pages/jobs.mjs` passes as the web address. This is within the
accepted text: the address is the snapshot's own repository address (MOD-repository-hosts' `RepositoryAddress.web`).
