---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - cfa11c426763ab1a9affaf56646b2bd1581a1cf6
  - https://github.com/akmaier/agent-m/pull/1110
date: 2026-10-19 17:25 UTC
---
# Development → Release testing: ITM-1085, a proposed test case may be of level user

**REGISTER**

## Reason

ITM-1085, pull request #1110 into `sprint/team2/97`, passes on `cfa11c42`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `fcfb938f` holds only the test, and CI failed on it.
2. **The change.** The level enum of `propose-tests`' answer schema holds the five levels of MOD-test-document.md:54, `user`
   among them. A case of level `user` is accepted, and one of another word is refused.
3. **Scope.** `src/job-catalogue/kinds/propose-tests/` and the test.
