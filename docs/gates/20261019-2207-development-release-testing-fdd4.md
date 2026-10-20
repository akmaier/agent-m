---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 1a1150cf44f298fd631cd1bfe08cb4105491963b
  - https://github.com/akmaier/agent-m/pull/1169
date: 2026-10-19 22:07 UTC
---
# Development → Release testing: ITM-1140, four more workflow-entries tests make their repositories without git maintenance

**REGISTER**

## Reason

ITM-1140, pull request #1169 into `sprint/team2/97`, passes on `1a1150cf`. CI is green, on 20 of 20 jobs. Only the
helpers of four test files change.

1. **A refactoring, as the item declares.** The evidence is the writer, counted with `GIT_TRACE2_EVENT`. I repeated the
   count: over the four files, `git maintenance` starts 107 times on `sprint/team2/97`, which is the known positive and
   matches g's 21, 18, 55 and 13. On the head it starts 0 times.
2. **No expected result changes.** In both runs 16 pass. The one failure, in `workflow-entries-job-workflow`, fails the same
   way on the base, as #1161 recorded.
