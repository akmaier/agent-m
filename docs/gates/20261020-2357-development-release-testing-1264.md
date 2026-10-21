---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 387c5fce3cfe0c16c77917716c125c5e33e8bb25
  - https://github.com/akmaier/agent-m/pull/1264
date: 2026-10-20 23:57 UTC
---
# Development → Release testing: ITM-1169, every test declaration states each field on one line

**REGISTER**

## Reason

Pull request #1264 into `sprint/team1/103` passes on `387c5fce`. CI is green on 23 of 23 checks (run 39517396786). CI on a
sprint branch leaves release tests out.

1. **The commits.** Each has one parent and its trailers.
   - `c0c5d423` holds only `tests/test-document-one-line.test.mjs`. It is red: job 118948198208 reads TST-1169002 as
     `not ok 522`, then "# fail 1" and "# cancelled 0". TST-1169001, the wrapped-field counter-proof, passes.
   - `0af7d586` (developer-sonnet-d) rewrites the non-release headers.
   - `387c5fce` (developer-sonnet-b) rewrites the four release declarations, TST-1056003, 006, 101 and 102.
     - b's commits touch neither `src/desktop-shell` nor `src/bridge-build`, so b implemented none of what they test
       (SPEC.md:1501-1503).
2. **The words are unchanged.** For each of the 44 changed test files, every line's comment marker was dropped and the
   rest joined, at `291df64d` and at `387c5fce`.
   - 43 files read the same.
   - The one difference is the glued `file//` in `tests/trace-graph-impacts.test.mjs`, which is split so that `input:`
     stands on its own line. The pull request names it.
3. **The replay**, in a clean worktree at `387c5fce`, with a private `TMPDIR`:
   - **The module tests:** `tests/test-document-*.test.mjs`, 29 of 29 pass.
   - **The counter-proof:** with `tests/` at `291df64d` beside the new test file, TST-1169002 fails, 1 of 2.
   - **The python release tests** `test_bridge_release` and `test_bridge_settings`: 8 of 8 OK.
   - **All 72 node release-test files:** 435 pass, 0 fail, 9 `todo`, as at sprint 102's end.
4. **The merge.** `git merge-tree` with `sprint/team1/103` at `291df64d` is clean, and so is the merge with #1266.
