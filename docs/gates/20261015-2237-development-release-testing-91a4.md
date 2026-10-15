---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 9dbe3cff22f3fc615880745aac6f2e0352c49a90
  - https://github.com/akmaier/agent-m/pull/526
date: 2026-10-15 22:37 UTC
---
# Development → Release testing: ITM-491, A hand-over to a Bridge carries its task

**REGISTER**

## Reason

ITM-491, pull request #526 by developer-sonnet-a into `sprint/team1/28`, head `9dbe3cff`.

1. The tests-only commit `af430120` was red (run 38817139760).
2. CI is green on the head (run 38817806207, ten of ten jobs). Node shard 6 failed once, on the ITM-294 reverse-tunnel
   component test, which touches none of the changed files, and passed when the same commit ran again.
3. The changed files:
   - The item's modules: `src/bridge-http/protocol.mjs` and `src/bridge-http/server.mjs` of MOD-bridge-http, and
     `src/bridge-client/index.mjs` of MOD-bridge-client.
   - The new test file `tests/bridge-job-task-491.test.mjs`.
   - In `tests/bridge-client-324.test.mjs` only the needle by which TST-324002's counter-proof finds its line changed. That
     is how the test prepares its fixture.
   - In `tests/bridge-http-323.test.mjs`, TST-323001's expected request of `POST /v1/jobs` now holds the optional `task`,
     as MOD-bridge-http's accepted wire table states. ITM-491 names that test since `8aeb243f`.
4. TST-491001 to TST-491003 name their modules and requirements; three counter-proofs are recorded in #526.
5. The Acceptance holds:
   - `handOver` sends the task only in the request's body, and only when it is given.
   - The wire accepts both bodies, and answers 422 for a task that is not text.

Noted for the review:

- The ITM-294 reverse-tunnel component test failed once and passed on the same commit, so it may be flaky.
- MOD-bridge-http's file gives no notation for an optional field of `bridgeApi`; the developer chose `string?`.
- ITM-491's Acceptance was extended at the gate to name TST-323001.
