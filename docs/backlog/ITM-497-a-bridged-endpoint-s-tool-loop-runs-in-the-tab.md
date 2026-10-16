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

One loop serves both: `endpointDriver` takes an optional `exchange`, through which `bridgeDriver` passes the Bridge's
`ask`, so MOD-runtimes keeps no second copy of the loop. This was accepted in `90ed6d66` (`docs/approvals/MOD-endpoint-calls-1f24a36cd76a.md`), and MOD-endpoint-calls
joins the modules.

**The readings, settled at sprint team1/53:**
- **Only with tools.** MOD-runtimes' `bridgeDriver` runs the loop "for an endpoint given `tools`" (Interfaces,
  `bridgeDriver`). MOD-endpoint-calls has a loop only where "the input carries `tools`". So:
  - an input with tool definitions goes through `endpointDriver(config, participant, exchange)` (MOD-endpoint-calls), where
    `exchange` is the Bridge's `ask` of one exchange;
  - an input without tools, and every agent target, keeps today's single `ask` with `driverPrompt`'s text.
- **MOD-endpoint-calls.** `endpointDriver` (`src/endpoint-calls/index.mjs:186`) takes the optional third argument. Its
  loop (`toolLoop`, `:161`) calls it in place of `endpointExchange` for each request. A call without it is unchanged.
- **The wire, built by ITM-520.**
  - MOD-bridge-client's `ask` sends `{ endpoint, exchange }` when the target carries the exchange, as
    `ask(bridge, { endpoint, exchange })` (TST-324003, `tests/bridge-client-324.test.mjs:41–52`).
  - It returns `{ text, calls, usage }`, and the protocol declares the body (`src/bridge-http/protocol.mjs:24`).
  - MOD-bridge-client does not change.
- **MOD-bridge-jobs.** `POST /v1/ask` (`src/bridge-jobs/handlers.mjs:65`) refuses a body without a text `input` today.
  - It answers `{ endpoint, exchange }` — a valid configuration, and `messages` and `tools` as lists — with
    `endpointExchange`, which its Uses name.
  - The ask's entry gains the `calls` the endpoint made.
  - A failure is read as an endpoint ask's failure is today, with the key replaced.
  - The entries of the other asks keep their form.
- **No interface outside the Uses.** MOD-runtimes uses `MOD-endpoint-calls.endpointDriver` and
  `MOD-bridge-client.ask`, and MOD-bridge-jobs uses `MOD-endpoint-calls.endpointExchange`. Each was found in its module
  file's `uses:`.

**Existing tests whose expected result changes: none.** The tests were grepped for `bridgeDriver`, `/v1/ask` and
`exchange`.
- TST-472698, TST-472700 and TST-398020–022 (`tests/runtimes-bridge.test.mjs`) send no tools, so their single
  `{ endpoint, input }` ask holds.
- TST-472697 is `queueJob`'s refusal of a moved head, which this item does not touch. The earlier list named it by
  mistake.
- TST-472084 deep-equals the entry of an `{ endpoint, input }` ask, which keeps its form.
- None of TST-472088's refused bodies (`tests/bridge-jobs-endpoint-ask.test.mjs:213–214`) carries an `exchange`, so each
  stays refused.
- `tests/runtimes-tab-endpoint-tools.test.mjs` leaves what a Bridge does with an endpoint it calls to this item (its
  header, note 4). Its only Bridge ask is an agent's.

**The UC-019 counter-proof table** plants faults in `src/endpoint-calls/index.mjs`, so the developer runs it
(`AGENT_M_418_COUNTERPROOF=1`, `tests/release-uc-019-change-requirements-by-prompt.test.mjs:678`).

## Acceptance

- A fixture Bridge answers each exchange; the calls are carried out in the tab and the answer ends the loop.
- An input without tools is still one `ask` with the prompt.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
