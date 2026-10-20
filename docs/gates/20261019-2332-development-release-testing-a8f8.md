---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - ee533fe22865645141d990e09667d2f0301fb70e
  - https://github.com/akmaier/agent-m/pull/1181
date: 2026-10-19 23:32 UTC
---
# Development → Release testing: ITM-1132, the check tests/test_job_record.py

**REGISTER**

## Reason

ITM-1132, pull request #1181 into `sprint/team2/97`, passes on `ee533fe2`. CI is green, on 20 of 20 jobs.

1. **The writer.** developer-sonnet-h began the file and disclosed that its ITM-1025 wrote part of a job's record.
   developer-sonnet-g took the branch over and owns the tests: g kept h's cases, added a CI case end to end through
   `onDispatch`, and implemented none of the job-record code (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).
2. **Tests only, over built code.** The red evidence is 8 planted faults.
   - I repeated one: `newJobId` that does not avoid a taken identifier (`src/job-ledger/index.mjs:227`) fails a case.
3. **Named as not testable as worded, accepted:**
   - **A run names its jobs.** SPEC.md:1886-1888 asks it. MOD-run-planner's `nextActions` and `finishRun` are not built:
     on `sprint/team2/97` neither is exported, while the same search finds `runOf`. The case belongs with ITM-977,
     which builds them, and its acceptance now names it.
   - **The instance's repository against the product's** is asserted as the record landing in the host the job is given.
   - **The Bridge's End record** is not reached here.
4. **The description** is still a placeholder. g's text is kept for akmaier, since the agents do not edit a pull
   request's body.
5. **To merge:** the move of the file in TST-513201 and TST-513202, in a commit of its own, made by developer-sonnet-i, who
   is neither g nor h.
