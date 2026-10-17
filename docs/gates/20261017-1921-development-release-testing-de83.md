---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 13c8950629b92eaaf0796008803c48a91a44426d
  - https://github.com/akmaier/agent-m/pull/751
date: 2026-10-17 19:21 UTC
---
# Development → Release testing: ITM-742, the findings of a schedule

## Reason

ITM-742's first commit 1ae087f2 holds only `tests/test-schedule-findings.test.mjs`; CI run 39061755494 is red on it,
failing that file alone. CI run 39061893649 is green on the head. Only `src/test-schedule/rules.mjs`,
`src/test-schedule/index.mjs` and the new test naming MOD-test-schedule change. TST-742001..007 name what they guard,
the module and level `unit`; each counter-proof is recorded in the pull request, TST-742002's was reproduced. The
Acceptance holds. Both readings stand on the accepted text: a runner route is `ci runner:<label>`, the one route
MOD-participant-list gives a self-hosted runner; the third rule is named by a requirement the item realises.
