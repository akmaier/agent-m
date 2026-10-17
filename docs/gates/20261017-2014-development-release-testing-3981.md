---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: rejected
on:
  - b495bf0f826bdc7ecffa80ffbd0e2cbc50044db0
  - https://github.com/akmaier/agent-m/pull/763
date: 2026-10-17 20:14 UTC
---
# Development → Release testing: ITM-751

**REGISTER**

## Reason

ITM-751, a test's history across commits and releases: pull request #763 by developer-sonnet-h into `sprint/team2/78`,
on head `b495bf0`, branched at `6cb7315`.

The condition that does not hold: `A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`, for TST-751001. Its recorded fault —
the filter of commits without a record of the test dropped from `testHistory` — leaves it green on the head: its fixture
has no commit on which only TST-002 ran, so every commit holds a record of TST-001. Only TST-751005 fails with that fault.
The same replay turned TST-751002 to TST-751005 red on their recorded faults.

The other checks hold: the first commit `5264657` holds only `tests/result-records-history.test.mjs`, and CI was red on it
(run 39065428832, node (5): `testHistory` not exported); CI is green on the head (run 39065584201); only
`src/result-records/read.mjs`, `src/result-records/index.mjs` and the new test, whose header names MOD-result-records,
change; the Acceptance's five cases are tested. `testHistory` being async while the module file types it without
`Promise` is the gap already noted for `resultsAt` (#196), no reason by itself.
