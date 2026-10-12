---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 7a0d23b9b01d8caf893769e3b9adff396dd50305
  - https://github.com/akmaier/agent-m/pull/471
date: 2026-10-12 23:18 UTC
---
# Development → Release testing: ITM-325, a job handed over to a Bridge, and an agent on a Bridge as a driver

**REGISTER**

## Reason

ITM-325, pull request #471 by developer-sonnet-c into `sprint/team1/25`, head `7a0d23b`. The first commit `8ecd5ab`
holds only tests and was red on them alone (run 38320491634); `7a0d23b` is green (run 38321156280, 2308 tests, 0
failures). The code changes only `src/runtimes/`, `bridge.mjs` among the module's Parts; the new test names MOD-runtimes
and its guards, and 31 faults are recorded, none surviving. The Acceptance holds: `queueJob` on the Bridge route commits
the start and then hands the job over, and a hand-over that fails after the commit throws the client's error with the
start committed, so the job stays queued; `bridgeDriver` sends through `ask` and returns the answer and usage.

The points weighed:
- One expected result of ITM-319's test in `tests/runtimes-tab.test.mjs` changes, from `BridgeDriverMissing` to
  `BridgeNotConnected { bridge }`, its fixture as it was. ITM-319 refused a Bridge's endpoint or agent as
  `BridgeDriverMissing` until `bridgeDriver` existed (its gate, `fb99e30`); ITM-325's Outcome has `runOnTab` build that
  driver, "each Bridge by its name among `connections.bridges`", so the case changes to a Bridge the connections do not
  hold — the behaviour the Outcome names, as `docs/instructions/developers.md` rule 3 lets it change. The name
  `BridgeNotConnected` is not in MOD-runtimes' file; noted for the review.
- `ask` takes no abort signal, so a cancel in the tab does not reach an ask on a Bridge; noted for the review.
- A reviewer of a job run on a Bridge: the tab drives reviewers through their own routes; a job the Bridge itself runs
  is the gap with akmaier and is not this item's.
