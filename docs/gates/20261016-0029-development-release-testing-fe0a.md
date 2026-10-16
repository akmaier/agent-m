---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 20ff7293afc1ba24a26d8c34c3c2b123db330af8
  - https://github.com/akmaier/agent-m/pull/540
date: 2026-10-16 00:29 UTC
---
# Development → Release testing: ITM-521, A failure while a SPEC entry is shown is named on the page

**REGISTER**

## Reason

ITM-521's unit test and code, in pull request #540 into `sprint/team1/32`, at head `20ff7293`. developer-sonnet-d made
both commits.

1. **The red commit.** The tests-only commit `ee5bbddd` holds only `tests/review-pages-failure-after-snapshot.test.mjs`,
   and CI was red on it (run 38829124307, TST-521101).
2. **CI is green on the head**: ten of ten jobs, run 38829258714.
   - With #541's fix of the release test file, I ran UC-006's system and release files and TST-521101 on this head: 82
     tests, 82 passing.
   - The developer lists the release tests of MOD-review-pages and UC-006 in the pull request.
3. **The changes stay in the item's scope.** `src/review-pages/flow.mjs` is the item's module: `render`'s steps after
   the snapshot move into `view`, wrapped in one try/catch that appends `problem(failure, token)`. The new test file
   names MOD-review-pages. No existing test changed in this pull request; TST-479203 was changed by developer-sonnet-e
   in #539.
4. **The new test.** TST-521101 names its requirements and module, and states its expected values in its own text.
   Counter-proof: with the catch removed, TST-521101, TST-521201 and TST-479203 fail. I ran that too, and all three
   fail.
5. **The Acceptance holds.**
   - The release test was written before the code by a Developer who implemented none of the review pages.
   - The page now draws one problem paragraph naming the used-up limit and its reset, with no word of the token. For a
     refused token, it draws Access's message.
   - Only `src/review-pages/` and a test naming MOD-review-pages changed.
   - The catch wraps all of `render` after the snapshot, and the paragraph is appended, as the start decision named.

Merge order: after #541, whose fix the release tests need.

Noted for the review: the tests-only commit was amended and force-pushed once before its red run (the earlier red run,
38828813565, was on `d01315d2`). Sprints 17 to 27 agreed that a pushed item branch is never rewritten. The commit the
gate checks is tests-only and was red, so check 1 holds.
