---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - ca654793df73ab0f4f892f3f773c2a7586097227
  - https://github.com/akmaier/agent-m/pull/742
date: 2026-10-17 18:33 UTC
---
# Development → Release testing: ITM-685, the stages of a product's progress are measured in their module

**REGISTER**

## Reason

ITM-685, pull request #742 into `sprint/team1/74`, at head `ca654793`. This is the rework after the rejection on
`ae6d99c2` (`docs/gates/20261017-1825-development-release-testing-a79d.md`). It is mergeable, and run 39058389770 is
green.

**The rejection is met.**
- The Tests stage has no share, and its detail names the missing fact: "the commits of the default branch are unknown".
  That is MOD-progress-measures' own rule for a share that needs an unknown fact.
- `stageShares` reads nothing now, and `stages.mjs` no longer imports `tracesTo` and `resultsAt`.

**Red first.** The tests-only commit `4d23be88` was red in run 39058164137 on behaviour, not on a missing name:
- TST-685007 and 008, the missing-fact detail;
- TST-685015, no reads.

The code was pushed after that run had ended and been read.

**Tests and counter-proofs.**
- TST-685009, 016 and 017 tested only the narrowed measure, and they went with it. The pull request adds 14 tests.
- The new F12, which gives the Tests stage a share, fails 007, 008 and 015. F1, F2 and F5 to F11 are still caught.
- The node suite fails the same 30 tests by name as the base, and no release result changed. ITM-018 passes, and CI's
  Python jobs pass.

**Everything else accepted at the first gate stands:**
- readings 5 to 8;
- ITM-809 for the default branch's results, the instance's own bar and the types;
- the note in ITM-684.

**The reading.** For the rework, the developer read the rejection's record in full. The first round's full reading
stands.
