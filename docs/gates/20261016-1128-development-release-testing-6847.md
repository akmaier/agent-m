---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - dbe1091d7a30f8775430c99eee4ec9fef7ee6334
  - https://github.com/akmaier/agent-m/pull/568
date: 2026-10-16 11:28 UTC
---
# Development → Release testing: ITM-529, A handed-over task reaches the prompt of the work kinds

**REGISTER**

## Reason

ITM-529, pull request #568 into `sprint/team1/40`, at the unchanged head `dbe1091d`, decided again after the rework on
the one condition of the first decision (`docs/gates/20261016-1124-development-release-testing-22fc.md`).

1. **The red commit.** The tests-only commit `c5d34b1a` is now red on CI: run 38893728425, head
   `c5d34b1ad0dcf6e3bdcdb0e28f51bbbe815dec82`, conclusion failure. The failing tests are TST-472283 (node 4) and TST-529001,
   529002 and 529003 (node 1), and no others.
   - The run came from draft #569, of a branch at that commit, which is closed unmerged and whose branch is deleted.
   - #568's branch was not rewritten, and the run is named in #568.
2. **CI is green on the head**: ten of ten jobs. The pull request is mergeable.
3. **The changes stay in the item's scope.** Only the `kind.md` and `prompt.md` of `implement`, `refactor`, `write-tests`
   and `fix-bug` in `src/job-catalogue/`, and two test files that name MOD-job-catalogue, changed. TST-472283's table
   gains `instruction?`, as the item names it.
4. **The tests.** TST-529001 to TST-529003 state their values in their own text. Five planted-fault counter-proofs are
   recorded in #568. The developer lists chapters 9, 11, 12 and 13 and SPEC.md as read in full.
5. **The Acceptance holds.**
   - Each of the four kinds names `instruction` first, as optional.
   - Each prompt holds `{{instruction}}` under `## The task as the person gave it`, before the inputs.
   - `prepareJob` of `implement` holds the task as the part `instruction` when given, and no such part otherwise.
