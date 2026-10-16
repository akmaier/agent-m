---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - a5c51c4206b77050e9afdfc0d184162f0b704f43
  - https://github.com/akmaier/agent-m/pull/653
date: 2026-10-16 23:50 UTC
---
# Development → Release testing: ITM-625, The release panel's tests wait by the clock for what they expect

**REGISTER**

## Reason

ITM-625, pull request #653 into `sprint/team1/57`, at head `a5c51c42`. developer-sonnet-d wrote it.

1. **No red commit is possible, and the planted slowness stands in for it**, as at ITM-569's gate
   (`docs/gates/20261016-2043-development-release-testing-671b.md`). Only the tests' waits change, so all six tests pass
   before and after.
   - The cause is shown at the failure node of job 117245246534: the Accept click's listener awaits WebCrypto's digest
     (`blobSha`), and `settle` returned after five silent turns.
   - With a digest planted to answer after 100 ms, the old wait fails four tests and the new one passes all six.
   - At 1,500 ms and after ten turns, the new wait passes.
   - A digest that never answers fails four tests with "never: <what>" after about ten seconds.
2. **CI is green on the head**: run 38983282799 passed ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's scope**: two test files. `tests/test-pages-release.test.mjs` waits with `until`,
   imported and not copied. `tests/prompt-bar.d/until.mjs`'s header gains MOD-test-pages.
   - No assertion and no expected value changed; the diff removes no `assert` line.
   - The UC-013 release and system tests pass before and after, and so do the helper's other users. ITM-018 passes.
4. **The Acceptance holds.**
   - No wait in the file is bounded by turns.
   - A slow handler passes, and one that never answers fails, naming what was awaited.
   - The six tests keep their expected values.

**One condition is wider than its assertion, and is taken.** After *Start*, the wait also requires that the start "has
not finished" yet, so that two loads do not race. It decides only when the test reads the page, not what it expects.
