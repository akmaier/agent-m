---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 796ad21fa80be90c443733c359300a70145c2fec
  - https://github.com/akmaier/agent-m/pull/613
date: 2026-10-16 18:08 UTC
---
# Development → Release testing: ITM-563, UC-019's mended findings become tests

**REGISTER**

## Reason

ITM-563, pull request #613 into `sprint/team1/48`, at head `796ad21f`. developer-sonnet-e wrote it, and implemented none
of ITM-551, ITM-558, ITM-559 or ITM-562 (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`). It lists the following as
read in full: AGENTS.md, SPEC.md, the item, `48.md`, UC-019, MOD-trace-pages, MOD-site-frame, MOD-review-pages,
MOD-prompt-bar and chapters 9, 11, 12 and 13.

1. **No red commit is possible.** The behaviour is already mended. The counter-proofs ran in a copy of `src/`:
   - a bare `draft` as the draft route fails only TST-418007;
   - the `NoPersonSource` error removed fails only TST-418008;
   - the examples removed from `prompt-bar` fail only TST-377116.

   Restored, all pass. The listing of `/private/tmp/claude-501/` was the same before and after the work.
2. **CI is green on the head**: ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's scope.** One commit changes only three UC-019 test files.
   - **The three tests.** TST-418007 (S7), TST-418008 (S8) and TST-377116 (S15) lose their `todo` mark and finding
     text, and keep every expected value.
   - **The registry.** TST-377001 and TST-377101 ask for a `todo` for every entry of the findings maps, so the three
     entries move to the evidence maps. That is why `system-uc-019-change-by-prompt.test.mjs` changes too.
   - **The other findings.** TST-377012 (S11) stays `todo` and names ITM-559. S9, S10, S12, S13 and S14 are untouched.
   - **ITM-018** gives 8 before and 8 after.
4. **The release tests, before and after.**
   - `release-uc-019-change-by-prompt`: 24 pass and 1 todo before, 25 pass and 0 todo after.
   - `system-uc-019-change-requirements-by-prompt`: 22 pass and 2 todo before, 24 pass and 0 todo after.
   - The other two files are unchanged.
5. **The Acceptance holds.** The three tests pass as plain tests, a planted fault in each mend fails its test, and only
   test files change.

The reading that the entries move to the evidence maps is taken. The item's "become plain tests" is read together with
the two registry tests, which allow no plain test among the findings. The expected values are unchanged.
