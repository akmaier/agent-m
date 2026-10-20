---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 54dd539bf1aa67924c58c6a5f18fa4422767dc3a
  - https://github.com/akmaier/agent-m/pull/1129
date: 2026-10-19 18:40 UTC
---
# Development → Release testing: ITM-618, MOD-work-plans' recipe sprint-facts

**REGISTER**

## Reason

ITM-618, pull request #1129 into `sprint/team2/97`, passes on `54dd539b`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `4148177b` holds only tests, and CI run 39301524848 failed on it.
2. **The accepted text** (`3baeb13a`, accepted in `d70bfbf5`). `sprint-facts` gives `sprintFacts`, built from:
   - the sprint named by the parameter `sprint`;
   - the product's tests;
   - the items' states, with `productWorkflow`;
   - its jobs;
   - the branch `test-results`;
   - its pull requests and issues.
   Where the host gives no issues, they are named as not read.
3. **The changed test.** TST-619009, ITM-619's unit test, pinned the recipes to `["architecture-and-model"]` and now holds
   `sprint-facts` too. It is not a release test.
4. **g's reading, accepted, and its gap registered.**
   - MOD-repository-hosts' `Issue` has no date of opening or closing. g reads an issue as the sprint's when one of its
     comments is dated within the time box. That builds without a text change (AGENTS.md §6a.6).
   - Its limit is named: an issue opened and closed without a comment is missed.
   - The exact dates need a draft of MOD-repository-hosts' `Issue`, registered as ITM-1102.
