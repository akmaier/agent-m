---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 6409e9ee24bd34e44f8f0b4d5c09d9b117066234
  - https://github.com/akmaier/agent-m/pull/623
date: 2026-10-16 19:35 UTC
---
# Development → Release testing: the mend of ITM-505's test wait

**REGISTER**

## Reason

Pull request #623 into `sprint/team1/50`, at head `6409e9ee`. It is the mend that gate `71ca` named. developer-sonnet-e
made it, and did not build ITM-505. It followed ITM-527's commit `0810d787` (§6a.1).

1. **The failure it mends is shown, and the mend is checked.** The saved log shows the failing test ending after 23 ms,
   when the 600 turns were spent before the proposal was drawn. The counter-proofs ran in copies:
   - the old `until`, with a condition slowed to 1,500 calls, fails "never: the proposal is shown" at 317 ms;
   - the new `until` with the same condition passes;
   - the new `until` with a condition that never holds fails at 10,009 ms, naming it.

   Restored, the file passes 17 of 17, ten runs in a row. The listing of `/private/tmp/claude-501/` was the same before
   and after the work.
2. **CI is green on the head**: run 38955813918, ten of ten jobs. GitHub reports the pull request mergeable.
3. **The change is exactly the mend.** One line of `tests/prompt-bar-hand-over.test.mjs` changes. `until` now waits
   until 10 seconds of clock have passed, tries its condition once more, and fails naming what it waited for. The file's
   mock timers fake only `setTimeout`, so `Date.now` and `setImmediate` stay real. `settle` and every expected value are
   unchanged, and ITM-018 passes.
4. **The tests are unchanged in what they hold.** The file passes 17 of 17 before and after.
5. **The sprint's gate is decided again** on #622's new head, where its full CI runs.
