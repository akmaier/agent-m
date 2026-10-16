---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - ff6eb8635987fc8e875ded959231b56d4e76d682
  - https://github.com/akmaier/agent-m/pull/627
date: 2026-10-16 20:00 UTC
---
# Development → Release testing: ITM-548, The job workflow is added to a product's .gitlab-ci.yml, every other line kept

**REGISTER**

## Reason

ITM-548, pull request #627 into `sprint/team1/51`, at head `ff6eb863`. developer-sonnet-a wrote it. The gate before
(`98fc`, on `c10480b7`) was rejected for one reason: an inline `inputs:` got a second `inputs:` block. Two commits follow
`c10480b7`, and nothing was rewritten.

1. **The new tests-only commit is red.** `a01be626` was pushed alone. Run 38958577828 failed exactly TST-548009 on node
   (0), as the log saved before any re-run shows. The test gives a header with `inputs: {}` and an entry with
   `inputs: { job: x }`. Each must throw `GitlabCiNotList`, with the start of its message stated in the test's text, and
   return nothing.
2. **CI is green on the head**: run 38958828603. GitHub reports the pull request mergeable.
3. **The fix.** In `src/runtimes/ci.mjs`, an `inputs:` that is not written as a block, in the header or in the entry,
   throws `GitlabCiNotList`. Its message names the part: "the inputs: of the spec: header is not written as a block", or
   "the inputs: of the entry for .gitlab/agent-m-jobs.yml is not written as a block".
4. **Each fault is caught.** Dropping either refusal fails TST-548009. Restored, the runtimes' and settings pages' tests
   pass 341 of 341. The listing of `/private/tmp/claude-501/` was the same before and after the work.
5. **The Acceptance holds, with the reading settled in the item.** Every form the change would have to rewrite is
   refused with nothing written. A file that lacks nothing stays unchanged.

The checks carried over from `98fc` still hold.

**The message's second sentence**, as the developer names it, says that Agent M adds its entry only to an `include:` that
is a list. That does not fit the two new cases, whose first sentence names the part rightly. It does not make the
behaviour wrong, and no acceptance line asks for that sentence. Its wording is mended with MOD-runtimes' next item,
ITM-567, which now names it.
