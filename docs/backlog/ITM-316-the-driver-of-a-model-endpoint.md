---
id: ITM-316
title: The driver of a model endpoint
level: module
realises:
  - UC-005
  - UC-007
  - UC-010
  - UC-019
  - ONE DEFINITION, THREE DRIVERS
  - A RUNTIME IS INTERCHANGEABLE
  - NO COST IS GUESSED
  - AN UNSUPPORTED ENDPOINT SAYS SO
modules:
  - MOD-endpoint-calls
builds_on:
  - ITM-260
tests:
  - unit
origin:
  - UC-005 step 4
  - UC-007 step 3
  - UC-010 step 3
  - UC-019 step 6
---
# ITM-316 The driver of a model endpoint

**REGISTER**

## Outcome

MOD-endpoint-calls' `endpointDriver(config, participant)`, as its file states it, in a browser and in Node: `send` turns
the job runner's `DriverInput` into one chat request to an OpenAI-compatible or an Anthropic endpoint, as the provider
documents it, and returns the answer's text and the usage the endpoint reported, or `null` where it reports none —
nothing is estimated; one `send` is one request, never repeated; a failure throws `EndpointFailed { diagnosis }` with
`diagnoseEndpoint`'s reason — a refused key, a call the browser blocked, the network, a request refused for its length,
which is never answered by cutting the input —; a cancel through the signal aborts the request. Wherever it runs it
calls the endpoint directly and neither selects nor reaches a Bridge. The tab's route (ITM-319), the job workflow's
entries (ITM-365) and a Bridge answering an endpoint ask in Node (ITM-408) use it. Nothing else of the module is part of
this item.

## Acceptance

- Unit tests that name MOD-endpoint-calls state, before the code exists, with constructed answers and no paid service:
  the request each kind of endpoint receives for a fixture input; the text and the reported usage; `null` usage where
  none is reported; a refused key, a request too long and a blocked call failing as `EndpointFailed` with their reasons
  and no second request; an aborted signal; the same driver run in Node.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/endpoint-calls/` and the tests that name MOD-endpoint-calls change.
