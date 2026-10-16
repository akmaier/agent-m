---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 7e20d20c964174c50b6a3b36fbaca58630e824b1
  - https://github.com/akmaier/agent-m/pull/573
date: 2026-10-16 11:52 UTC
---
# Development → Release testing: ITM-530, The prompt bar's What is this? explains the bar

**REGISTER**

## Reason

ITM-530, pull request #573 into `sprint/team1/41`, at head `7e20d20c`. developer-sonnet-b made both commits. It lists
AGENTS.md, SPEC.md, chapters 9, 11, 12 and 13, the item, `41.md`, MOD-site-frame, MOD-prompt-bar and UC-049 as read in
full.

1. **The red commit.** The tests-only commit `0b11741a` was pushed alone, and CI was red on it (run 38896020755). Exactly
   the seven new tests, TST-530101 to TST-530107, failed on behaviour, beside the two existing `TODO` findings.
2. **CI is green on the head**: ten of ten jobs, run 38896401363. The pull request is mergeable. Locally, 351 tests of
   MOD-site-frame, MOD-prompt-bar and UC-003, UC-004 and UC-019 run with none failing and seven `todo`.
3. **The changes stay in the item's scope.** Only `src/site-frame/explanations.md` gains the topic `prompt-bar`, and one
   new test file names MOD-site-frame. No existing test changed.
4. **The new tests.** They state each expected sentence in their own text. Each planted fault in the topic failed only
   its own test, and renaming the heading failed all seven.
5. **The Acceptance holds.** The topic states the five points of the item, in its order, and `explain("prompt-bar")`
   gives it; without the topic, the tests fail.

**The developer's readings hold.**
- No executable check of named topics exists — `tests/site-frame.test.mjs` says it is not tested there — so TST-530101
  and TST-530107 check this topic.
- "Handed over" is UC-049 4a's *Hand over*.
