---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - b3c0fd9b1b584e4020dfb5b8eb3d8c9e915322a3
  - https://github.com/akmaier/agent-m/pull/1101
date: 2026-10-19 17:08 UTC
---
# Development → Release testing: ITM-1091, a group names backlog items of four or more digits

**REGISTER**

## Reason

ITM-1091, pull request #1101 into `sprint/team2/97`, passes on `b3c0fd9b`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `d127ca33` holds only the test, and CI failed on it. A second tests-only commit, `379f7894`, which names the
   rule `ITM-99` is refused under, was red on CI too.
2. **The fix.** `docs/assets/artifacts/groups.mjs:39`, taken over by MOD-group-document (MOD-group-document.md:38), reads
   `ITM-\d{3,}`, as MOD-identifiers.md:54 states. Only that line and the test change.
3. **The test.** ITM-100, ITM-999 and ITM-1000 are read as backlog items, and `ITM-99` is not. Nothing here orders items.
