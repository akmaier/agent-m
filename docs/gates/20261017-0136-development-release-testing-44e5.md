---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - f66d393b816175dfcee31f21f7d44d1c1d4978d9
  - https://github.com/akmaier/agent-m/pull/668
date: 2026-10-17 01:36 UTC
---
# Development → Release testing: ITM-621, A GitlabCiNotList message for a plain-string entry says its own case

**REGISTER**

## Reason

ITM-621, pull request #668 into `sprint/team1/60`, at head `f66d393b`. developer-sonnet-a wrote it.

1. **The tests-only commit is red.** `3b5c7c93` was pushed alone, and run 38991098972 failed on it. The Scrum Master read
   the saved log: node (4) shows `# fail 1`, TST-604003, failing on behaviour with the include ending still in the
   message. The one `todo` is the standing ITM-369-1. The expected value was fixed before the run.
2. **CI is green on the head**: run 38991359134 passed ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's module**: `src/runtimes/ci.mjs` and its test file.
   - The grep, run again with its known positives, found only the hits the item names. No release test holds the
     texts.
   - The fetch spy saw no call. The release tests of UC-010, UC-011 and UC-017 pass, and so does ITM-018.
4. **The planted fault is caught.**
5. **The Acceptance holds.** The plain-string entry's message ends with "Agent M passes its inputs only through an
   entry written with local: and inputs:, and rewrites no line of the product's own — write the entry so, then install
   again.", the item's sentence word for word. TST-604003 states the whole message.

**The reading is taken.** Only the ending is replaced. The why-sentence, "the entry for .gitlab/agent-m-jobs.yml is a
plain string, which cannot pass the inputs on.", names the case already. The item's Outcome finds fault with the ending
alone: "That sentence does not fit, because the `include:` is a list."
