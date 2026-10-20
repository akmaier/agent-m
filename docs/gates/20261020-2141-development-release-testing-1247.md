---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 1bc50422850054c1f6e57b07f53f6cc6ea5a8346
  - https://github.com/akmaier/agent-m/pull/1247
date: 2026-10-20 21:41 UTC
---
# Development → Release testing: ITM-667, the release test of UC-020's gaps

**REGISTER**

## Reason

Pull request #1247 into `sprint/team1/102` passes on `1bc50422`.
- It is one commit, with one parent (`f8a117bb`) and its trailers.
- It adds only `tests/release-uc-020-gaps.test.mjs`, and no source file. So no behaviour is added or changed, and
  `AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST` (SPEC.md:1426-1428) does not apply.
- CI is green on 23 of 23 checks (run 39501561159). CI on a sprint branch leaves release tests out.

1. **Not the implementer.** developer-sonnet-b wrote the test. ITM-599, the gaps view, was built by developer-sonnet-d,
   and b built none of it. So the test meets `RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER` (SPEC.md:1501-1503) and
   ITM-667's acceptance, which also excludes developer-sonnet-d.
2. **The test.** TST-020701 to 020705, level `release`, modules MOD-trace-pages and MOD-site-frame.
   - It guards UC-020 steps 7, 7a and 7b through MOD-site-frame's route `trace` with `key=gaps`, as ITM-667 asks.
   - The page is found by the use case's words, not by class names.
3. **The local replay**, in a clean worktree at `1bc50422`, with a private `TMPDIR`: 5 of 5 pass.
4. **Counter-proofs.** This gate planted two faults and restored each:
   - the gaps descriptor's title "Gaps" changed to "Gapz" (`src/trace-pages/views.mjs:24`), the counter-proof ITM-667
     names: 1 of 5 fails;
   - the 7a text "There are no gaps at" changed (`src/trace-pages/flow.mjs:311`): 1 of 5 fails.
   - b's ten faults in `src/trace-pages/` are listed in the pull request.
5. **No finding.** Changing the descriptor's `versions` from `branch-and-tags` to `branch` fails no test, as b reports.
   No file in `src/` or `docs/assets/` reads a descriptor's `versions`: the search found only the three descriptors'
   own lines (`src/trace-pages/views.mjs:12`, `25`, `33`), and the same search finds the 15 readers of `.title` in
   `src/trace-pages/`. A change that nothing reads cannot fail a test, so no item is registered.
6. **The merge.** `git merge-tree` of `1bc50422` with `sprint/team1/102` at `f8a117bb` is clean. #1248 (ITM-768) is not
   gated yet; whoever merges second merges the sprint branch in first, as sprint 102 says.
