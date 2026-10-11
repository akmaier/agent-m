---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - a67791823d72a83745dd3a292ba543c9e6aa650b
  - https://github.com/akmaier/agent-m/pull/409
date: 2026-10-11 19:48 UTC
---
# Development → Release testing: ITM-421, a mailbox operation through a Bridge

**REGISTER**

## Reason

ITM-421, pull request #409 by developer-sonnet-a into `sprint/team1/19`, head `a677918`. The tests-only commits
`93c8868` and `f1d27bf` were red on the five new tests alone (runs 38169147121, 38169211119); CI is green on
`a677918` (run 38169367373, 1776 tests, 0 failures). The code changes only `src/bridge-client/index.mjs`; the new
test names MOD-bridge-client and its guards, and 11 faults are recorded, the one that survived on the draft killed by
`f1d27bf`. The Acceptance holds: method, path and body for `test`; the token in the header, the password in the body
only; each error of the Bridge as its `BridgeError`.

The statement weighed: `mailCall` goes through the client's one `call`, whose single `fetch` sends to
`${bridge.address}${path}` — the Bridge the caller hands in, the origin `NO SERVER` permits as the local bridge. The
new path is `/v1/mail/{operation}`, the operation one of the ten `bridgeApi` lists, so the request reaches only a
route of MOD-bridge-http's protocol on that same Bridge, as `handOver`, `ask` and `testBridge` already do; MOD-bridge-
client's file has `mailCall` send "as the client's other requests carry them". Keeping `call` as it is keeps the
permitted channel; it reaches nowhere new. That the guard's description in `tests/test_no_backend.py` still names only
the pairing and endpoint-test paths is noted for the review.
