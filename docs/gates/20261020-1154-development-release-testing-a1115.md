---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 78748a06e4c6706469465385f89059eb5c131b06
  - https://github.com/akmaier/agent-m/pull/1198
date: 2026-10-20 11:54 UTC
---
# Development → Release testing: ITM-1115, passed — the review pages reach an endpoint through the runtimes

**REGISTER**

## Reason

ITM-1115 (MOD-review-pages, MOD-runtimes), pull request #1198 into `sprint/team1/97`, passes on `78748a06`.

- **Two commits, one parent each, no merge, both with the trailer `developer-sonnet-a`.**
  - `a9e31867` holds only tests:
    - TST-111501 in `tests/runtimes-tab.test.mjs`;
    - TST-111502 in the new `tests/review-pages-reach-endpoints-through-runtimes.test.mjs`.
  - `78748a06` changes `src/runtimes/tab.mjs` and `src/review-pages/jobs.mjs`.
    - `runOnTab` hands its hook `from` to `runJob`, as MOD-runtimes' accepted text says (`58e6f89c`).
    - `checkDraft` runs through `runOnTab` with no record, and the page no longer imports `endpointDriver` or `runJob`.
- **The red,** run 39417532060 on `a9e31867`, with `# fail 1` and `# cancelled 0` in each failing job:
  - job 118610088622: exactly TST-111501;
  - job 118610088759: exactly TST-111502.
- **The test added with the code is kept.** TST-111503 checks that the first request after *Check this edit* carries
  the edited sentence. It is a counter-proof that the mutation "the page drops `from`" showed missing, and no expectation
  of the red tests changes.
- **sonnet-a's readings are kept:**
  - "builds no endpoint driver of its own" is read from the page's imports;
  - the fixture's draft carries findings, so the drafter is asked again, and the test checks that the edit is carried.
- **It meets the Acceptance:** the page's tab job runs through `runOnTab`, with a counter-proof. Only `src/review-pages/`,
  `src/runtimes/` and tests that name their modules change.
- **CI:** 20 of 20 checks passed on the head (run 39417829116).
- **Merge:** `git merge-tree --write-tree` onto `sprint/team1/97` (`cae2df40`) is clean.
- **Replayed in a clean worktree at the head:**
  - The 540 tests of `tests/runtimes*` and `tests/review-pages*` pass.
  - Counter-proof: with `591d5a24`'s `src/`, exactly TST-111501 and TST-111502 fail.
