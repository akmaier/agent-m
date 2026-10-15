---
id: ITM-487
title: An endpoint is asked one exchange of a tool loop, and its test tells whether it calls a tool
level: module
realises:
  - UC-003
  - UC-049
  - AN UNSUPPORTED ENDPOINT SAYS SO
  - NO COST IS GUESSED
modules:
  - MOD-endpoint-calls
builds_on:
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-endpoint-calls, Interfaces: endpointExchange, testEndpoint
---
# ITM-487 An endpoint is asked one exchange of a tool loop, and its test tells whether it calls a tool

**REGISTER**

## Outcome

MOD-endpoint-calls' `endpointExchange` sends one request of a tool loop in the endpoint's own form — tools of an
OpenAI-compatible endpoint, tool use of an Anthropic one — and returns the endpoint's text, its tool calls and the usage
it reported, carrying no call out. `testEndpoint` offers the model one harmless tool and says whether it called it —
`tools` and `toolMessage` (UC-003 step 5, 5a).

## Acceptance

- Against fixture servers of both kinds, an exchange returns text, calls and usage as each server answered, and a
  failure is `EndpointFailed` with its diagnosis.
- The test reports `tools: true` for a model that calls the tool, `false` with its message for one that refuses or
  answers without calling it.
- Every claim about each provider's tool format is read from the provider's documentation and named in the pull
  request.
