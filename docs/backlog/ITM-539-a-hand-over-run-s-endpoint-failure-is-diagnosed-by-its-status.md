---
id: ITM-539
title: A hand-over run's endpoint failure is diagnosed by its status
level: module
realises:
  - UC-049
  - AN UNSUPPORTED ENDPOINT SAYS SO
modules:
  - MOD-workflow-entries
builds_on:
  - ITM-498
tests:
  - component
origin:
  - the gate of #583 (ITM-498, sprint team1/43)
  - MOD-workflow-entries, onDispatch — the summary names "the reason that MOD-endpoint-calls' `diagnoseEndpoint` gives"
---
# ITM-539 A hand-over run's endpoint failure is diagnosed by its status

**REGISTER**

## Outcome

When a hand-over run's agent fails working with an endpoint, the entry names the reason as MOD-endpoint-calls'
`diagnoseEndpoint` gives it. MOD-agent-processes' `agentDriver` throws `AgentFailed { exitCode, lastOutput }` and reports
no status of the endpoint, so the entry has no status to classify. It builds against the draft of MOD-workflow-entries'
Uses committed on `main` for akmaier's acceptance, which adds `testEndpoint`.
- After `AgentFailed` in a run with `endpoint`, the entry calls `testEndpoint` once with that endpoint's configuration and
  the key.
- Where `works` is false, the run's summary names its `diagnosis` — a refused key, an unknown model, an unreachable
  address — and the routes that would work.
- Where it works, the failure is the agent's, and the summary names `AgentFailed`'s last output, as today.

The draft was accepted with `90ed6d66` (`docs/approvals/MOD-workflow-entries-e8d9eb778f11.md`). Today the entry
classifies `AgentFailed`'s last output with `diagnoseEndpoint` (`src/workflow-entries/product.mjs:156–159`). This item
replaces that with one `testEndpoint` call and its `diagnosis`.

**Where the endpoint works**, settled at its first gate (#616, `343fdc6a`), the failure is the agent's. The reason names
`AgentFailed`'s exit code and its last output, and nothing else:
- it does not name the endpoint as not reachable;
- it does not offer other routes;
- it does not pass the last output through `diagnoseEndpoint`.

MOD-workflow-entries names the diagnosis and the routes only for "an endpoint the run cannot reach". Once `testEndpoint`
shows that it works, the run did reach it. "As today" in the line above means the last output is named, as it was
before any endpoint was classified.

**Existing tests.** TST-498006 (`tests/workflow-entries-hand-over.test.mjs:355`), an endpoint the run cannot reach,
keeps its expected reason `not reachable`. Its run now makes the one `testEndpoint` request, which the test's fixture
must answer or refuse without leaving the machine. That is checked under a `fetch` spy. No other test names
`AgentFailed` with an endpoint in MOD-workflow-entries.

## Acceptance

- A fixture opencode whose endpoint answers 401, 404 and no connection gives the three reasons `diagnoseEndpoint` gives
  for them.
- Each test states its expected values in its own text.
