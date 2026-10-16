---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 7bf47b0eda4e16c58a091aa75791bd979062b700
  - https://github.com/akmaier/agent-m/pull/632
date: 2026-10-16 20:43 UTC
---
# Development → Release testing: ITM-569, The prompt bar's and the frame's tests wait by time, not by turns

**REGISTER**

## Reason

ITM-569, pull request #632 into `sprint/team1/52`, at head `7bf47b0e`. developer-sonnet-e wrote it, as `52.md` assigns.
It lists AGENTS.md, SPEC.md, the item, `52.md`, MOD-prompt-bar, MOD-site-frame and chapters 9, 11, 12 and 13 as read in
full.

1. **No red commit is possible.** Only the tests' waits change. The counter-proofs ran in a copy:
   - with the condition held back 450, 650 or 5,000 polls, the helper passes and the old 400-turn copy fails "never: the
     bar is drawn";
   - a condition that never holds fails at about 10 seconds, naming it.

   Restored, the tests pass. The listing of `/private/tmp/claude-501/` was the same before and after the work.
2. **CI is green on the head**: run 38964029945, ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's scope.** Tests only:
   - the new `tests/prompt-bar.d/until.mjs`, with `tick` and `until(condition, what, limitMs = 10000)`;
   - five test files, each losing its own `until` and importing the helper.

   `git grep "async function until"` in those files now finds only the helper. No expected value changes, and `settle`
   and `settleLong` stay, since they wait for no condition. The helper's header names `MOD-prompt-bar; MOD-site-frame`,
   as other headers name several modules, and ITM-018 passes before and after.
4. **The waits hold.** Each of the five files passes ten runs in a row. Only `tests/prompt-bar-hand-over.test.mjs` fakes
   timers, and only `setTimeout`, so the helper's clock is real.
5. **The Acceptance holds.** Every `until` of these files is bounded by 10 seconds of clock and names what it waited
   for. A slowed condition that the old copy fails by turns is waited for by the new one.
