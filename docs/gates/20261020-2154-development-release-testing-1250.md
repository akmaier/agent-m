---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 9223ab3b
  - https://github.com/akmaier/agent-m/pull/1250
date: 2026-10-20 21:54 UTC
---
# Development → Release testing: ITM-769, two releases are compared in the tests view

**REGISTER**

## Reason

Pull request #1250 into `sprint/team1/102` passes on `9223ab3b`. CI is green on 23 of 23 checks. CI on a sprint branch
leaves release tests out.

1. **The commits.** Each has one parent and its trailers, except the merge.
   - `86ecedd6` holds only `tests/trace-pages-tests-compare.test.mjs`. Its CI is red: the raw log of job 118904501744
     reads `not ok 309` to `not ok 314`, all six new cases, then "# fail 6" and "# cancelled 0" (SPEC.md:1426-1428).
   - `139ea6ed` changes only `src/trace-pages/tests.mjs` and `flow.mjs`. That is within ITM-769's bound: only
     `src/trace-pages/` and the tests that name MOD-trace-pages.
   - `9223ab3b` merges `sprint/team1/102` at `2339793c`, and `git show --cc` is empty.
2. **The acceptance.** The fixture holds two tags and one test of each class:
   - added, removed, guards changed, expected result changed, and outcome changed;
   - one unchanged test, which is listed in none.
3. **The readings, judged.** UC-029 step 6 reads "The reviewer picks two releases to compare". MOD-trace-pages.md:117
   gives the tests view "comparing two releases". So:
   - **The control shows only at a release tag.** The current text is not a release, so a comparison starts from a shown
     release.
   - **The older of the two is the one later in the list of tags,** whichever is shown. The list of tags is newest first,
     so the result does not depend on which one is open.
   - **A test changed in what it guards and in what it expects is listed in both classes.** The step names the classes,
     not that they exclude each other.
   - **A test with no record at a release reads "not run" there.** A change from or to "not run" is a change in outcome.

   None of the four adds a rule the texts do not hold.
4. **The replay**, in a clean worktree at `9223ab3b`, with a private `TMPDIR`:
   - **The module's tests:** `tests/trace-pages*.test.mjs`, 149 of 149 pass, none `todo`.
   - **The counter-proof:** with `src/` checked out at the base `2339793c`, the new file fails 6 of 6.
   - **The release tests that name MOD-trace-pages:** 7 files and 50 cases. 48 pass and none fails. The two `todo` cases
     are the known findings ITM-657 and UC019-S10, which this change does not touch.
5. **The merge.** `git merge-tree` of `9223ab3b` with `sprint/team1/102` at `2339793c` is clean. #1248 and #1249 change
   the same module; whichever merges after #1250 merges the sprint branch in first.
