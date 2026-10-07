---
id: ITM-260
title: The short endpoint test and its diagnosis
level: module
realises:
  - UC-003
  - AN UNSUPPORTED ENDPOINT SAYS SO
  - A CREDENTIAL IS NEVER PLACED IN A URL
  - NO SECRET IN THE REPOSITORY
modules:
  - MOD-endpoint-calls
builds_on: []
tests:
  - unit
origin:
  - UC-003
---
# ITM-260 The short endpoint test and its diagnosis

**REGISTER**

## Outcome

Build only testEndpoint and diagnoseEndpoint, with EndpointConfig and Diagnosis, from MOD-endpoint-calls: one short request asking for a one-word answer to an OpenAI-compatible or Anthropic endpoint; works/model on success, and the accepted diagnosis on failure. It changes nothing stored. The browser opt-in and provider request formats follow the current provider documentation verified during implementation. Do not build endpointDriver, job execution or the correction loop. A Bridge-side use waits for the accepted refinement named in docs/backlog/sprints/09.md.

## Acceptance

- Constructed responses cover both endpoint kinds, an optional key, success, the provider's refused-key/model/rate-limit/error messages, a network failure and browser blocking.
- Credentials appear only in the request's authorisation header. One test sends one short request without a retry; no storage or repository writer is used.
- A browser blockage offers the named CI/Bridge alternatives and preserves the observable reason; tests do not claim to distinguish errors the browser conceals.
- Only src/endpoint-calls/ and new tests naming MOD-endpoint-calls change.
- The tests-only first commit has red CI; final-head CI is green; every new test has a recorded planted-fault counter-proof. Tests use constructed responses and no paid service.
