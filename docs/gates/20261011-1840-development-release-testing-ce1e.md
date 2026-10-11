---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - cff7bae87442e4058b945f6b70d5bd698184e4c7
  - https://github.com/akmaier/agent-m/pull/397
date: 2026-10-11 18:40 UTC
---
# Development → Release testing: ITM-419, the Bridge protocol's mail route

**REGISTER**

## Reason

ITM-419, pull request #397 by developer-sonnet-b into `sprint/team1/18`, head `cff7bae`. The first commit `052146c`
holds only `tests/bridge-http-mail.test.mjs`, and CI was red on it (run 38164290208): its eight tests fail, and no
other test does. CI is green on `cff7bae` (run 38164492596, 1687 tests, 0 failures). The code changes only
`src/bridge-http/protocol.mjs` and `server.mjs`; the new test names MOD-bridge-http and its guards, and 38 faults
planted on the draft are recorded, none surviving. The Acceptance holds, case by case.

The reading weighed: MOD-bridge-http's file lists the mail errors among the protocol's **Errors** with their codes,
and states `bridgeApi` as "the protocol above, as data: ... the errors with their codes"; it does not say that they
stand in one object. The pull request keeps `confirmation-refused` (409), `no-encryption`, `login-refused` and
`upstream-failed` (502) in `bridgeApi`, on the mail route, since TST-261001 pins `bridgeApi.errors` with
`deepEqual` and no expected result may change. The errors are in `bridgeApi` with their codes, as the file states.
Whether they move into `bridgeApi.errors` together with TST-261001's expected result is noted for the review.
