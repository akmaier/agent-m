---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 9ec629afff52b403dab6ae25f90093b1188395e0
  - https://github.com/akmaier/agent-m/pull/464
date: 2026-10-12 22:19 UTC
---
# Development → Release testing: ITM-400, reworked

**REGISTER**

## Reason

ITM-400, pull request #464 by developer-sonnet-b into `sprint/team1/24`, reworked once on the condition its rejection
named (`e31fb3e`), now on head `9ec629a`, with commits added only. The condition holds: `startWorkflow` in
`github.mjs` no longer matches a 422's message, so any 422 stays the host's own failure, and `NotSupported` is left
only for a server reached without a token. The test `cd8163e`, a 422 naming the `workflow_dispatch` trigger answered
as the host's failure, was red (run 38314784001), and `9ec629a` is green (run 38315350298); the 23 faults were planted
again, s8 now putting back a match on the trigger's message, which test 6 kills. What the rejection read besides stands.
