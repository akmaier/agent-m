---
id: ITM-488
title: A model endpoint works in a tool loop
level: module
realises:
  - UC-049
  - ONE DEFINITION, THREE DRIVERS
  - NO COST IS GUESSED
modules:
  - MOD-endpoint-calls
builds_on:
  - ITM-486
  - ITM-487
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-endpoint-calls, Interfaces: endpointDriver
---
# ITM-488 A model endpoint works in a tool loop

**REGISTER**

## Outcome

Where a `DriverInput` carries `tools`, `endpointDriver` offers their definitions, hands each call the endpoint makes
to `tools.call`, returns its result, and goes on until the endpoint answers without a call — at most `tools.limit` calls,
then once more without tools; the usage is the sum of what each request reported. Each request is one
`endpointExchange`.

What the module file leaves unstated, and what is built:
- **Without tools.** Where the input carries no `tools`, or a `ToolUse` with no definitions, `send` makes the one request it
  makes today. Nothing changes there.
- **The messages.**
  - They begin with the person's turn, `driverPrompt(input)`.
  - After each answer with calls, they gain the assistant's turn with its text and calls, and then one turn of role
    `tool` per call, with its `callId` and the text `tools.call` returned.
  - Each request is `endpointExchange(config, { messages, tools: tools.definitions })`.
- **The limit.** Calls are carried out one by one, in the order the endpoint made them, until `tools.limit` calls have
  been carried out.
  - A call of the same answer beyond the limit is answered with the tool text `refused: the limit of <n> tool calls is
    reached`, since the endpoint expects a result for each call.
  - Then one request follows with `tools: []`, and its text is the answer.
- **The usage.** The sum of each field over the requests that reported usage. It is `null` when none did.
- **A cancel.** `endpointExchange` takes no signal, so the driver checks `options.signal` before each request and before
  each call, and aborts there with the abort error `send` throws today. A request already sent is not cut off.
- **A failure.** An `EndpointFailed` of any request ends `send` with it, and no request is repeated.

No existing test's expected result changes, release tests included. The tests of `endpointDriver`
(`tests/endpoint-driver.test.mjs`, `tests/endpoint-driver-release-21.test.mjs`, `tests/runtimes-tab.test.mjs`) send no
tools, and `endpointExchange`'s tests are unchanged.

## Acceptance

- A fixture endpoint that calls two tools and then answers yields that answer, the two calls carried out in order,
  and the summed usage; at the limit, one request without tools follows.
- A cancel through the signal aborts the loop; a failed request is not repeated.
- The first commit holds only the tests, and CI is red on it.
- Each test states its expected values in its own text (`A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT`); an
  existing test that the change turns red is not changed here: the Developer stops and names it.
