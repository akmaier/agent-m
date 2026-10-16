---
gate: Release testing → Sprint review
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 8bd13905cdce42f15edcbc884606eada2d841973
  - https://github.com/akmaier/agent-m/pull/622
date: 2026-10-16 19:28 UTC
---
# Release testing → Sprint review: sprint team1/50

**REGISTER**

## Reason

Sprint team1/50, pull request #622 of `sprint/team1/50` into `main`, at head `8bd13905`.

**A test of this sprint's own item fails.** Run 38954801168 fails on node (5), in job 117154831918, with exactly one
failure:
- `not ok 94 - a hand-over proposed by a participant that holds no implementing role shows the reason and queues
  nothing` (`tests/prompt-bar-hand-over.test.mjs:347`);
- the error is `never: the proposal is shown`, thrown by `until` (line 56).

The Scrum Master saved the log before any re-run.

**The cause.** Line 56 reads:

    async function until(condition, what) { for (let at = 0; at < 600; at += 1) { if (condition()) return; await tick(); } assert.fail(`never: ${what}`); }

It is bounded by 600 turns of the event loop, not by time. Under CI's load, the proposal took more than 600 turns:
`assess` → `productFacts` → `startable` → `routesFor`. The same test passed on #621's own run, so the failure depends on
load. That is what a bound in turns does, and it is the defect ITM-527 mended in UC-006's test.

**The mend.**
- **What.** A pull request into `sprint/team1/50` bounds that file's `until` by 10 seconds of clock, as ITM-527 did, and
  fails naming what it waited for. `settle` (line 57) waits for no condition: it only lets the loop drain before a test
  asserts that nothing happened, so it stays. No expected value changes.
- **Who.** developer-sonnet-e, who did not build ITM-505 and built ITM-565's time-bounded wait.
- **The proof.** A counter-proof with a slowed condition: the old `until` fails by turns, and the new one waits. Then
  #622's CI runs again on the new head, and this gate is decided again there.

**Beyond this file.** The same turn-bounded `until`, at 400 turns, stands in `tests/prompt-bar.test.mjs:53`,
`tests/prompt-bar-fixed.test.mjs:46`, `tests/site-frame-prompt-bar.test.mjs:44` and
`tests/site-frame-prompt-bar-foot.test.mjs:35`. These are four copies, in tests of MOD-prompt-bar and MOD-site-frame.
They have not failed, and they are not this sprint's code. So they are not in this mend: ITM-569 bounds them by time, as
one helper.

For the retrospective: a test that waits for an asynchronous condition bounds the wait by time, not by turns, as ITM-527
established.
