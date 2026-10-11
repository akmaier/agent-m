---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - f8339767389b7e57968a1a50032f5792c57e7806
  - https://github.com/akmaier/agent-m/pull/389
date: 2026-10-11 18:06 UTC
---
# Development → Release testing: ITM-437, reworked

**REGISTER**

## Reason

ITM-437, pull request #389 by developer-sonnet-c into `sprint/team1/17`, reworked once on the condition its rejection
named (`86fa3e7`), now on head `f833976`. The condition holds: `architecture-ready` reads an open SPEC change as a queue
entry that no approval record names, from the queue's entries and MOD-approvals' own records, without MOD-spec-changes,
as MOD-spec-changes' Data derives `open`; an entry a record names under an earlier text is `stale` and one approved but
not yet written is `approved`, neither open. The rework holds the checks too: the tests-only commits `7c9c3de` and
`44f3ccf` were red (runs 38161690356, 38161928612), the fix is green (run 38162230200), and it changes only
`src/approvals/strategies.mjs`, with 30 planted faults recorded. Over this repository it finds 16 open SPEC changes, the
entries of 2026-09-23 that ITM-454 concerns, and one stale entry, 2026-09-30g 01, not counted open.
