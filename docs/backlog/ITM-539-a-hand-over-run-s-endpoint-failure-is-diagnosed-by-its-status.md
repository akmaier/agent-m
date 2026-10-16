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

## Acceptance

- A fixture opencode whose endpoint answers 401, 404 and no connection gives the three reasons `diagnoseEndpoint` gives
  for them.
- Each test states its expected values in its own text.
