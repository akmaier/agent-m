---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - a71abaf865e23859a3e5ba694d75aabce012b31b
  - https://github.com/akmaier/agent-m/pull/783
date: 2026-10-17 21:25 UTC
---
# Development → Release testing: ITM-840, the release test that a person is named by account or with consent

**REGISTER**

## Reason

ITM-840 adds only `tests/test_collaborators.py` and its cases `tests/test_collaborators.md`, the check SPEC names for
`A PERSON IS NAMED BY ACCOUNT OR WITH CONSENT`, with MOD-personal-data and level release in its header. CI is green on the
head; run on the head, the test passes, and three replayed faults in `src/personal-data/consent.mjs` each fail their case.
The third case, an account passes, guards the requirement's first half and stays within its one release test. Its
writer, developer-sonnet-i, is named by no commit of `src/personal-data/`.
