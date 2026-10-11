---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - bf33abf679960c7eed71c57792fb2670f1130eb9
  - https://github.com/akmaier/agent-m/pull/389
date: 2026-10-11 17:54 UTC
---
# Development → Release testing: ITM-437

**REGISTER**

## Reason

ITM-437, pull request #389 by developer-sonnet-c into `sprint/team1/17`, on head `bf33abf`. Checks 1 to 4 hold — the
tests-only commit `6753da3` red on its 5 tests (run 38160067005), the head green (run 38161376076), only
`src/approvals/strategies.mjs` and the new test naming MOD-approvals changed, 29 planted faults —; check 5 does not.

The condition that does not hold: `architecture-ready` reads an open SPEC change as a queue entry that no row
`uebernommen` names, whatever the row's reference, where the accepted texts derive an entry's state from the approval
records — MOD-spec-changes' Data: `open`, no approval record names its proposal; `approved`, a record names it and no
decision row names the record yet; `STATUS IS DERIVED FROM THE RECORDS` and `A REVIEWED ARTIFACT ENTERS THE DEFAULT
BRANCH AS OPEN`. So the 16 entries of 2026-09-23, whose rows name a commit and no record, read decided here and open
there — the question ITM-454 puts to akmaier —, and an entry approved but not yet written reads open. The developer may
rework once, on exactly this condition: an open SPEC change as the accepted texts derive it, from the queue's entries
and MOD-approvals' own records, without MOD-spec-changes.
