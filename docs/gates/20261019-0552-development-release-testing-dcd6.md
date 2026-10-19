---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 7246ae9a8ad456bdc18196ab6542a8b28ce1321a
  - https://github.com/akmaier/agent-m/pull/928
date: 2026-10-19 05:52 UTC
---
# Development → Release testing: ITM-757, the audit document of a release, reworked

**REGISTER**

## Reason

ITM-757, pull request #928 into `sprint/team2/94`, passes its second gate on `7246ae9a`. Its first rejection was `e411ef49`, on
`4717e3aa`.
- The head is a plain merge of the rework's head `b21e04f1` with the sprint head `38a61696`. Its tree equals the automatic
  merge of the two.
- CI is green on the head, on 20 of 20 jobs.

**The condition of the rejection holds on `b21e04f1`.**
- `evidence.records` lists every approval record whose `file` is the report, whatever blob it names.
- The acceptance and the limitations still come only from the record of the current blob (MOD-release-evidence.md:151-153,
  accepted blob `8654bba2`).
- Replayed: with the blob filter put back, TST-757003, TST-757004 and TST-757009 fail.
- TST-934005's changed expectation is the "missing:" behaviour already admitted for TST-756008: the accepted text says
  that `summary.limitations` names what is missing.
- The release-evidence tests pass, 56 of 56. Every release test file passes but the known local TST-320321902.
- The readings accepted at the first gate stand.
