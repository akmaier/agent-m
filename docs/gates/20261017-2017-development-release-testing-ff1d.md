---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 657fbf98b6ff41c1358ce2385e8cc832a22164f6
  - https://github.com/akmaier/agent-m/pull/763
date: 2026-10-17 20:17 UTC
---
# Development → Release testing: ITM-751

**REGISTER**

## Reason

ITM-751, a test's history across commits and releases: pull request #763 by developer-sonnet-h into `sprint/team2/78`,
reworked once after the rejection on `b495bf0` (docs/gates/20261017-2014-development-release-testing-3981.md), now on
head `657fbf9`.

The condition of the rejection holds now: `A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`, for TST-751001. Its recorded
fault — the filter of commits without a record of the test dropped from `testHistory` — replayed on the head turns
TST-751001 red (an extra mark for C4) and TST-751005 with it; with the fault removed all five are green. The rework
changes only TST-751001's fixture, adding commit C4 whose only record is of TST-002; its input and asserted result
(C1 passed, C2 failed, C3 passed) are unchanged.

The other checks hold as on `b495bf0`: the first commit `5264657` holds only the test file and CI was red on it; CI is
green on the head (run 39065931780); only `src/result-records/read.mjs`, `src/result-records/index.mjs` and the new test,
whose header names MOD-result-records, change; the Acceptance's five cases are tested.
