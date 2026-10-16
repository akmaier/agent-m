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
  - MOD-endpoint-calls
builds_on:
  - ITM-492
  - ITM-496
  - ITM-520
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
carried out in the tab. The wire of the exchange and its calls is ITM-520's.

It waits for akmaier's acceptance of the draft of MOD-endpoint-calls' file committed with sprint team1/44's start.
- **The gap.** MOD-runtimes' `bridgeDriver` is to run "the loop of MOD-endpoint-calls" in the tab, each request one `ask`.
  But MOD-endpoint-calls' interface keeps that loop inside `endpointDriver`, whose every request is an `endpointExchange`
  over the network. Building a second loop in MOD-runtimes would keep two copies of one loop.
- **The draft.** `endpointDriver` takes an optional `exchange`, with which `bridgeDriver` passes the Bridge's `ask`.

**Since the draft's acceptance** (`90ed6d66`, `docs/approvals/MOD-endpoint-calls-1f24a36cd76a.md`):
- **MOD-endpoint-calls joins the modules.** Its `endpointDriver(config, participant)` (`src/endpoint-calls/index.mjs:186`)
  takes the optional `exchange`.
- **The existing tests it touches**, found by grepping `tests/` for `bridgeDriver`. They assert that an endpoint on the
  Bridge receives one `ask` with `driverPrompt`'s text, which then becomes one `ask` per exchange of the loop:
  - TST-472697, TST-472698 and TST-472700 (`tests/runtimes-bridge.test.mjs`);
  - TST-398020–022, their endpoint targets.

  Before its start, each is read for whether its expected result changes or holds, and the item names them.
- **The wire of one exchange** is read from ITM-520's `ask` (MOD-bridge-client) before its start.

## Acceptance

- A fixture Bridge answers each exchange; the calls are carried out in the tab and the answer ends the loop.
