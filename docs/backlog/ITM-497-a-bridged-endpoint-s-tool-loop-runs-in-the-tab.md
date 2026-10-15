---
id: ITM-497
title: A bridged endpoint's tool loop runs in the tab
level: module
realises:
  - UC-049
  - ONE DEFINITION, THREE DRIVERS
modules:
  - MOD-runtimes
  - MOD-bridge-jobs
  - MOD-bridge-client
  - MOD-bridge-http
builds_on:
  - ITM-492
  - ITM-496
tests:
  - unit
  - component
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-runtimes, Interfaces: bridgeDriver; MOD-bridge-jobs, `POST /v1/ask`
---
# ITM-497 A bridged endpoint's tool loop runs in the tab

**REGISTER**

## Outcome

For an endpoint the Bridge calls, `bridgeDriver` runs the tool loop in the tab, each request one `ask` of one exchange
that MOD-bridge-jobs answers with `endpointExchange` — the endpoint's text, its tool calls and the usage —, each call
carried out in the tab.

## Acceptance

- A fixture Bridge answers each exchange; the calls are carried out in the tab and the answer ends the loop.

## Intake Decision

Registered, not selectable as the accepted texts stand: MOD-bridge-http's `POST /v1/ask` takes `{ endpoint, exchange }`,
but the answer of `GET /v1/ask/{ask}` is `{ state, text, usage, error }`, which carries no tool calls, and
MOD-bridge-client's `ask` names only `{ agent }` and `{ endpoint }` with `input` and returns `{ text, usage }`. No reading
of these texts brings the endpoint's tool calls back to the tab, so the item waits for akmaier's decision on the two
module files.
