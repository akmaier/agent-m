---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 6b61dd610b3dc45a32fec64fb6acaeab3f084c11
  - https://github.com/akmaier/agent-m/pull/688
date: 2026-10-17 05:02 UTC
---
# Development → Release testing: ITM-643, The settings page folds its explanations through the frame

**REGISTER**

## Reason

ITM-643, pull request #688 into `sprint/team1/65`, at head `6b61dd61`. developer-sonnet-e wrote it.

**What holds.**
- **Red.** The tests-only commit `f6cab155` was red in run 39004047885: `# fail 8` in node (0) and `# fail 4` in node
  (5), with `# todo 0` in both. These are exactly TST-643101 to 643104 and 643201 to 643208. Under a stub holding the
  topics only, the eight page tests failed on behaviour.
- **CI and merging.** CI is green, ten of ten in run 39004430109, and the pull request is mergeable.
- **Other checks.**
  - Six planted faults are caught.
  - The local suite fails the same 30 as the base.
  - `test_step_explanations`, ITM-018 and TST-290122 pass.

**Rulings on the departures.**
1. **All 16 calls are the item.** `git grep -c whatIsThis` on `sprint/team1/65` counts 17 in `settings.mjs`, 16 calls
   and the definition. The item's "four calls" was the start's miscount: it read only the first lines of its grep. Its
   Outcome, "`whatIsThis` goes", covers them all, and the item now carries a correction line. The UC-047 note fits :729,
   one of the 16.
2. **TST-290120, 290123 and 290124 are accepted as changed.**
   - The developer's run on a draft found them, as sprint 64's agreement asks the run to do. The start should have
     listed them, and its count was wrong.
   - Each claim they lose in place has a holder, and I read each one in the new files:
     - TST-643201 to 643207 pin which section holds which topic.
     - TST-643102 pins each topic's claims in `tests/site-frame-settings-explanations.test.mjs`. Among them are
       "give it only the minimum repository scope needed" (:63), "every five minutes … release test reports" (:76),
       "repository servers with the tokens of this browser and nowhere else" (:77) and "Nothing is checked while no
       dashboard page is open" (:78).
   - Together they hold more than the old regexes did.
3. **The change to `tests/release-sprint-07-uc-047-notifications.test.mjs` does not stand.** This is why the gate is
   rejected.
   - The test's header names `Module: MOD-notifications`. `AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES` (SPEC.md:1416)
     allows "tests that name one of those modules", and MOD-notifications is none of ITM-643's.
   - The test is of level release, and its fold is now the behaviour developer-sonnet-e implemented.
     `RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER` (SPEC.md:1471) reads "A test of level `release` is generated or
     written by a participant other than the one that implemented the behaviour it tests".
   - Adding MOD-notifications to the item would meet the first rule, not the second.
   - The start named this test among those that change, without saying who changes it. That was the start's gap.

**What is asked.**
1. **ITM-645, registered with this gate, goes first.** A participant other than developer-sonnet-e changes the
   release test's locator so that it finds the Notifications fold as what it is: the `<details>` whose `<summary>` reads
   *What is this?*. It passes on `sprint/team1/65` as it stands and on ITM-643's head, with no expected result changed.
   Its pull request goes into `sprint/team1/65`.
2. **Then #688 drops its edit of that release test, in a new commit,** with `sprint/team1/65` merged in, not rebased.
   Nothing else changes. The gate is then decided again on the new head, with CI green.

**The developer's finding.** The frame's check of topics is not built (`src/site-frame/index.mjs:5`). It is registered
as ITM-646. ITM-641 holds `embedRoute`.
