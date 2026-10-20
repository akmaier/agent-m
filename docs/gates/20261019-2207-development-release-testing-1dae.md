---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - fcb39e13165d26001627e713549311a20ffc4c4b
  - https://github.com/akmaier/agent-m/pull/1170
date: 2026-10-19 22:07 UTC
---
# Development → Release testing: ITM-1126, the prompt of the kind converse states Agent M's rules for what is drafted

**REGISTER**

## Reason

ITM-1126, pull request #1170 into `sprint/team2/97`, passes on `fcb39e13`. CI is green, on 20 of 20 jobs.

1. **Red first.** `1bd41615` holds only `tests/job-catalogue-converse-rules.test.mjs`, and its CI failed. I repeated it:
   with `prompt.md` as before, TST-1126001 fails, and on the head it passes.
2. **The text follows UC-049 step 3:** "everything is a proposal; a change of the SPEC is saved as a queue entry". It is
   added to the kind's one definition (`ONE DEFINITION, THREE DRIVERS`).
3. **The todo mark** of TST-513002 (ITM-1126) is removed by developer-sonnet-g, who did not implement ITM-1126, in a
   commit of its own on `itm-1126` before the merge.
