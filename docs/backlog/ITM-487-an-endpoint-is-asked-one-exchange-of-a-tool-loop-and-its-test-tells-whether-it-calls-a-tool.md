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
  - MOD-desktop-shell
  - MOD-bridge-jobs
builds_on:
tests:
  - unit
  - system
  - component
  - release
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

Existing tests whose expected result follows the accepted endpoint interface:
- TST-472213 (TST-260-001) and TST-472214 (TST-260-002), `tests/endpoint-calls.test.mjs`: a text-only `ok` fixture
  returns `tools: false` and `toolMessage: "ok"` beside `works` and `model`; the request offers the harmless tool rather
  than asking for a one-word answer with one output token.
- TST-292001, `tests/system-uc-003-direct-endpoint.test.mjs`: the exact request-body expectation is the tool probe.
- TST-268001, `tests/desktop-shell-endpoint-composition.test.mjs`: the forwarded answer carries the two new fields,
  and the captured request body is the tool probe. MOD-desktop-shell is included only for this owned boundary test;
  no Desktop production code changes.
- TST-266001, `tests/system-uc-003-dashboard-bridge.test.mjs`: the captured model request body is the tool probe.
- TST-294001, `tests/component-itm-294-https-reverse-tunnel.test.mjs`: the captured direct and bridged model request
  bodies are the tool probe, for each controlled web server.
- TST-269901, `tests/release-itm-269-endpoint-route.test.mjs`, and TST-266002,
  `tests/release-uc-003-dashboard-https-bridge.test.mjs`: the captured model request body is the tool probe.
- TST-268901, `tests/release-itm-268-desktop-shell.test.mjs`, and TST-472517,
  `tests/release-sprint-15-bridge-jobs.test.mjs`: the captured request body is the tool probe and the forwarded text-only
  answer carries `tools: false` and `toolMessage: "ok"`. MOD-bridge-jobs is included only for TST-472517's owned boundary
  expectations; no Bridge jobs production code changes.

The four release-case adaptations are made by a participant who implemented none of the endpoint behaviour.

The authentication, pairing, origin, request-count, storage and secret-boundary assertions remain unchanged. Production
changes stay in MOD-endpoint-calls' Parts; test expectations are stated literally, never read from a document at runtime.

## Acceptance

- Against fixture servers of both kinds, an exchange returns text, calls and usage as each server answered, and a
  failure is `EndpointFailed` with its diagnosis.
- The test reports `tools: true` for a model that calls the tool, `false` with its message for one that refuses or
  answers without calling it.
- Every claim about each provider's tool format is read from the provider's documentation and named in the pull
  request.
