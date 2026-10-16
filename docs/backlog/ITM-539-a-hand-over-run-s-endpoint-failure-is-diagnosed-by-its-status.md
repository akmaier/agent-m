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

When opencode, working with a hand-over's endpoint, fails, the entry hands `diagnoseEndpoint` the status the endpoint
answered, so that a refused key, an unknown model and an unreachable address are named as `diagnoseEndpoint` names them.
Today the entry builds the error from opencode's last output line without a status, so a 401 or a 404 is reported as "not
reachable". Where opencode reports the status is settled from MOD-agent-processes' file at this item's start.

## Acceptance

- A fixture opencode whose endpoint answers 401, 404 and no connection gives the three reasons `diagnoseEndpoint` gives
  for them.
- Each test states its expected values in its own text.
