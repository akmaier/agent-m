---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - abd3eb14c59f2ec2e4017ef2faf26b929352d7b6
  - https://github.com/akmaier/agent-m/pull/612
date: 2026-10-16 18:01 UTC
---
# Development → Release testing: ITM-562, The prompt bar's explanation gives UC-019's examples of an instruction

**REGISTER**

## Reason

ITM-562, pull request #612 into `sprint/team1/48`, at head `abd3eb14`. developer-sonnet-b wrote it, as `48.md` assigns.
- Its first report did not list SPEC.md, MOD-site-frame, MOD-prompt-bar and chapters 9, 11, 12 and 13 as read in full,
  and the Scrum Master held it back.
- It then read them in full and checked the pull request against them. That check found two outdated header comments,
  mended in `abd3eb14`.

1. **The tests-only commit is red.** `f5e0bcee` was pushed alone. Run 38943358959 failed on it:
   - TST-472812 on node (7), whose topic is now gone;
   - TST-530108 and TST-530109 on node (2), the new tests.

   TST-472806 passes there, since its list of topics only shrinks. The listing of `/private/tmp/claude-501/` was the
   same before and after the work.
2. **CI is green on the head**: ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's module.** `src/site-frame/explanations.md` and two site-frame test files.
   - TST-472806 and TST-472812 change, as the item names. TST-530101–107 are unchanged and pass.
   - No `change-instruction` is left in `src/`.
   - ITM-018 passes before and after.
   - The release test's TST-377116 is untouched and passes now under its todo mark, for ITM-563.
4. **Each fault is caught.** Removing an example fails TST-530108, and a second topic holding one fails TST-530109.
   Restored, the tests pass 55 of 55. Each new test has its known positive.
5. **The Acceptance holds.** The topic `prompt-bar` ends with UC-019 step 1's four examples: "split a requirement into
   two; make a rule checkable; add an alternative flow to a use case; align a use case with a requirement that has
   changed". No other topic repeats them, and `change-instruction` is gone.

The reading that only the examples move, in the old topic's wording, follows the item, which names only the examples.
UC-049 step 1's explanation of what the bar sends belongs to ITM-512.
