---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 846a8787c78681e6dbafc3c9bbf350845d48c0df
  - https://github.com/akmaier/agent-m/pull/636
date: 2026-10-16 21:48 UTC
---
# Development → Release testing: ITM-497, A bridged endpoint's tool loop runs in the tab

**REGISTER**

## Reason

ITM-497, pull request #636 into `sprint/team1/53`, at head `846a8787`. developer-sonnet-e wrote it.

1. **The tests-only commit is red.** `4640ddb6` was pushed alone, and run 38970961370 failed on it. The Scrum Master
   read the saved logs: exactly the twelve new tests failed, eight in node (1) and four in node (5), and nothing else.
2. **CI is green on the head**: run 38971420740 passed ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's three modules**, with three new test files and no existing test changed:
   - MOD-endpoint-calls: `endpointDriver` takes the optional `exchange`, and `toolLoop` calls it;
   - MOD-runtimes: `bridgeDriver` runs that loop for an endpoint whose input carries tools, each request
     `ask(bridge, { endpoint, exchange })`;
   - MOD-bridge-jobs: `POST /v1/ask` answers `{ endpoint, exchange }` with `endpointExchange`.

   ITM-018 and `test_no_backend` pass. The UC-019 counter-proof table, whose faults lie in
   `src/endpoint-calls/index.mjs`, gives each of its 29 entries.
4. **Each of the six planted faults is caught.**
5. **The Acceptance holds.**
   - A fixture Bridge answers each exchange. The calls are carried out in the tab, and the answer ends the loop.
   - An input without tools is still one `ask` with the prompt.

**The developer's readings are taken:**
- **A body with both `exchange` and `input` is an exchange ask.** MOD-bridge-jobs' text answers "the request [that]
  carries one exchange of a tool loop" with `endpointExchange`, and the protocol declares the exchange body.
- **`calls` is `[]` while an exchange ask runs and after it fails.** The protocol declares `calls` as a list, and only an
  exchange's entry carries it, so the entry of an `{ endpoint, input }` ask keeps its form (TST-472084). The headers of
  TST-497005 and TST-497007 state it.
- **No composition test imports across MOD-runtimes and MOD-bridge-jobs**, since neither module's Uses names the other.
  The wire is held from both sides: by TST-324003 for the client, and by the real `jobHandlers` in the new MOD-bridge-jobs
  tests.

**The five tests that failed under the developer's fetch spy do not hold this gate.**
- Four fail on the missing package `imapflow`, as before.
- TST-407001 also failed. It passes in CI on this head, so its failure under the spy is a property of the spy run, not
  of this change.
- The spy's purpose was to see that the item's tests reach only the test server, and they do.
