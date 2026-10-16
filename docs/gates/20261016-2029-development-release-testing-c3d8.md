---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 5991028cb637718610ded63f73ee726770752e6f
  - https://github.com/akmaier/agent-m/pull/629
date: 2026-10-16 20:29 UTC
---
# Development → Release testing: ITM-571, UC-019's S11 and S14 become tests

**REGISTER**

## Reason

ITM-571, pull request #629 into `sprint/team1/51`, at head `5991028c`. developer-sonnet-e wrote it, and implemented none
of ITM-559 (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`). It lists AGENTS.md, SPEC.md, UC-019, MOD-review-pages,
MOD-prompt-bar, chapters 9, 11, 12 and 13, the item and `51.md` as read in full.

1. **No red commit is possible.** The behaviour is ITM-559's, already merged. The counter-proofs ran in copies:
   - S11 with `paramsFor` without `draft` fails TST-377007 and TST-418104;
   - a `null` subject fails TST-377012, TST-377007 and TST-418104;
   - no draft route fails TST-377012;
   - S14's old text fails TST-418126 and TST-418115.

   Each was restored. The listing of `/private/tmp/claude-501/` was the same before and after the work.
2. **CI is green on the head**: run 38962319832, ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's scope.** One commit changes only three test files, and nothing in `src/`.
   - TST-418104's second answer is a readable draft, with every expected value and its two requests kept.
   - TST-418115 expects `formatFinding`'s form.
   - TST-418126 and TST-377012 are plain tests, their entries moved to the evidence maps.
   - **A file the item did not list.** `release-uc-019-change-by-prompt` loses S14 from its findings map. TST-377101
     asks for a `todo` for every entry there, so it changes with TST-418126, as ITM-563 did. It is taken as this item's.
   - **The counter-proof table.** Its entry that planted in `drawn()` no longer broke TST-418104 or TST-377007, and moves
     to `paramsFor` without `draft`, as the item asked.
4. **The release tests, before and after**, on local Node 26:
   - `release-uc-019-change-requirements-by-prompt`: 37 pass, 2 fail and 3 todo before; 40 pass, 0 fail and 2 todo
     after.
   - `system-uc-019-change-by-prompt`: 27 pass and 4 todo before; 28 pass and 3 todo after.
   - The other two files are unchanged, and ITM-018 passes.
   - With the counter-proof flag, all 29 faults fail their named tests and pass restored.
5. **The Acceptance holds.** Both tests pass as plain tests, a planted fault in each mend fails its test, only test
   files change, and the release tests' runs are recorded.

## A finding about the counter-proof table

The table could not run at all before this change. Its entry for TST-418003 named a one-line `paramsFor` in
`src/trace-pages/subject.mjs`, which ITM-558 (`d6d9f863`) made a block, so the run stopped at its second fault. The
developer mended that entry too. That is a change of the same release test's own table, without which its counter-proofs
could not be shown, and it is taken.

A table that runs only on a flag broke across a merge, and no gate saw it. Whether CI runs it, or every gate that touches
its sources does, goes to the retrospective.
