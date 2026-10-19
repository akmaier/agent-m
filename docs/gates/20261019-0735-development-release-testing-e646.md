---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 1e93bc3e0307217fdbc8f00132e9518bb066b1cb
  - https://github.com/akmaier/agent-m/pull/926
date: 2026-10-19 07:35 UTC
---
# Development → Release testing: ITM-646, rejected — a merge without its participant's trailer

**REGISTER**

## Reason

ITM-646 (MOD-site-frame), pull request #926 into `sprint/team1/93`, is rejected on `1e93bc3e`, for its history only.

- **What fails.** The merge `1e93bc3e` ("Merge remote-tracking branch 'origin/sprint/team1/93' into work/ITM-646") carries no
  `Agent-M-Participant:` trailer. Sprint 90's agreement, and the rule 93.md now states for every commit, ask it.
- **What holds:**
  - the content answers its rejection of `b0b9cdae`: TST-646001 to 646004 stand in `tests/site-frame-topics-check.test.mjs`;
  - `book-pointers` is restored;
  - the topic `source-selection` is added;
  - merge-tree onto `sprint/team1/93` is clean (tree `705fc190`).
- **What passes on the next head.** The change stands on a fresh branch from `sprint/team1/93` as commits that each carry
  the trailer, with no merge commit, as ITM-1066's #976 does.
