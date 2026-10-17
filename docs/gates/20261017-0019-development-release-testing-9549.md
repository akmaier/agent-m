---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 084f27dbfac31fb9599c27c4179a613b5e9c262b
  - https://github.com/akmaier/agent-m/pull/654
date: 2026-10-17 00:19 UTC
---
# Development → Release testing: ITM-588, Finishing the setup is MOD-settings-pages' setup route (after rework)

**REGISTER**

## Reason

ITM-588, pull request #654 into `sprint/team1/57`, at head `084f27db`, after the rejection on `6b0fbe77`
(`docs/gates/20261017-0006-development-release-testing-876e.md`). developer-sonnet-e wrote it. No pushed commit was
rewritten.

**What was asked is done.**
- `src/site-frame/explanations.md` gains the topics `setup-key` and `setup-store`, from UC-014 steps 7 and 8.
- `setup-key` names each permission with what it is for, and why *Only select repositories*, as step 7's "Why these?"
  says.
- `setup.mjs` calls `explain("setup-key")` and `explain("setup-store")`. `folded` is gone, and so is the permission table
  it held.

1. **The changed and new tests are red again on CI before the code.** That is sprint 56's agreement. The tests-only
   commit `4d16784a` ran as run 38985057100. The Scrum Master read the saved logs:
   - node (1) failed TST-588002, which now expects `explain`'s text;
   - node (3) failed the new TST-588015 to 588017 of MOD-site-frame.

   No expected value changed between that red and the green.
2. **CI is green on the head**: run 38985557203 passed ten of ten jobs. `git merge-tree` merges the pull request into
   the sprint branch without a conflict.
3. **The changes stay in the item's modules**, MOD-settings-pages and MOD-site-frame, and their tests. Nothing under
   `docs/assets/` changed. ITM-018, `test_step_explanations` and the module's and callers' tests pass, and the fetch spy
   logged nothing.
4. **The nine new planted faults are caught**, and the twelve earlier ones still fail their tests.
5. **The Acceptance holds.** The route `setup` gives *Finish setting up* as MOD-settings-pages states it, each step with
   its explanation from the frame. TST-474029 to 474032 stay unchanged and pass.

**A copy of test harness code is accepted for now.** `tests/settings-pages-setup.d/dom.mjs` carries the DOM part that
`explain` needs, copied from `tests/settings-pages-add-product.test.mjs`. That is the second copy of that harness. ITM-624
already moves it into a helper of its own, and now also has the setup tests use that helper, so the copy goes there.
These are tests of the same module, not product code.

**For the sprint's feedback.** A scratch path was again written with the Write tool, against the brief. It was a mistyped
directory, removed at once.
