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

## Acceptance

- A fixture endpoint that calls two tools and then answers yields that answer, the two calls carried out in order,
  and the summed usage; at the limit, one request without tools follows.
- A cancel through the signal aborts the loop; a failed request is not repeated.
