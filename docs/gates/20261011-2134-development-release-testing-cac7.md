---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - f1a1e8da929682c892cb531534969182b5cacdc5
  - https://github.com/akmaier/agent-m/pull/430
date: 2026-10-11 21:34 UTC
---
# Development → Release testing: ITM-326, reworked

**REGISTER**

## Reason

ITM-326, pull request #430 by developer-sonnet-b into `sprint/team1/21`, reworked once on the condition its rejection
named (`f9043e7`), now on head `f1a1e8d`, with commits added only: a merge of `sprint/team1/21`, which brings ITM-457,
and `f1a1e8d`, which returns `tests/desktop-shell.test.mjs` to the sprint branch's version. The condition holds: against
`sprint/team1/21` only `src/bridge-jobs/handlers.mjs` and `tests/bridge-jobs-agents.test.mjs` differ, no existing test
changes, and CI is green on `f1a1e8d` (run 38176749727) with TST-276002 sending its new work where ITM-457 put it. The
pull request's description still calls the earlier change of that test a change between jobs; it no longer applies.
What the rejection read besides stands.
