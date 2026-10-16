---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 67d2675d1372c881158f0a16b65b995f35c5fdbd
  - https://github.com/akmaier/agent-m/pull/593
date: 2026-10-16 14:59 UTC
---
# Development → Release testing: ITM-545, A Bridge job's live state, its log and its cancel

**REGISTER**

## Reason

ITM-545, pull request #593 into `sprint/team1/46`, at head `67d2675d`. developer-sonnet-c wrote it, as `46.md` assigns.

**The log stream asks the Bridge again at once while a job is quiet.** `followBridgeLog` (`src/runtimes/bridge.mjs:72–80`)
works as follows:
- it asks `bridgeJobLog(bridge, id, from)`;
- it yields the lines and returns once the answer has `ended`;
- otherwise it sets `from = next` and asks again in the same loop, with no pause.

The Bridge answers the log route at once: `bridgeApi` declares `GET /v1/jobs/{id}/log` with no wait. So while a running
job writes nothing, a page that follows its log sends the Bridge one request after another without end. The texts do
not say how often to ask: MOD-bridge-client gives the log "from a line on, so that a page can follow it", and the item
says "asks again from `next` until `ended`". So this is a reading, not a text change. It is now settled in ITM-545:
- **after an answer with new lines**, it asks again at once;
- **after an answer that has not ended and brought no new line**, it waits one second before asking again.

The developer adds this as a new commit, with a test that shows the pause. Node's test mock timers, or an equivalent
way, keep the test fast. A planted fault that drops the pause must fail that test.

**The other checks hold on this head**, and carry over to the next one:
1. **Red first.** The tests-only commit `b91cd7f9` was pushed alone. In run 38918004589 exactly TST-545001–009 fail
   (node (1)), and the changed TST-535010 fails (node (2)), on behaviour.
2. **CI is green on the head**: run 38919738605, ten of ten jobs. The pull request is mergeable.
3. **Scope.** The changes stay in MOD-runtimes: `src/runtimes/bridge.mjs` and `index.mjs`, two new test files, and
   TST-535010, as the item names. It imports from MOD-bridge-client only the three calls in MOD-runtimes' Uses.
   - Under the fetch spy, 914 tests make requests only to the loopback servers the tests start.
   - The release tests of MOD-runtimes pass.
4. **Counter-proofs.** Each of the 16 planted faults is caught.
5. **The rest of the Acceptance** holds against the fixture Bridge.

**The developer's other open points are taken as within the texts:**
- **`jobLog` and `cancelJob` throw the client's failure, and a Bridge missing from `bridges` is `NotFound`.** "never an
  error" is said of `liveState` only. ITM-535's CI route does the same (gate `4b9e`).
- **Cancelling a job the Bridge no longer knows throws `not-found` and ends nothing.** MOD-runtimes appends the end only
  "once the runtime confirms".
- **A Bridge state other than `running` gives `running: false`.** The item says "`running` while its `state` is
  `running`".
- **The rest:** a job matched by its id, a listed job `known`, the unreachable reason taken from the client, and the
  cancel's end as ITM-535's.
