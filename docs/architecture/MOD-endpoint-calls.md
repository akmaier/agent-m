---
id: MOD-endpoint-calls
title: The driver of model endpoints
folder: src/endpoint-calls/
realises:
follows:
  - ARC-046
uses:
  - MOD-job-runner.Driver
  - MOD-job-runner.DriverInput
  - MOD-job-runner.driverPrompt
  - MOD-job-runner.estimate
  - MOD-job-runner.Usage
  - MOD-job-runner.ToolUse
  - MOD-participant-list.Participant
provides:
  - EndpointConfig
  - Diagnosis
  - endpointDriver
  - endpointExchange
  - testEndpoint
  - listModels
  - modelContext
  - diagnoseEndpoint
---
# MOD-endpoint-calls The driver of model endpoints

## Responsibility

It belongs to Participants and jobs (ARC-046). It is the participant driver for model endpoints — OpenAI-compatible and
Anthropic, hosted or self-hosted — that a browser or Node calls directly: it sends a job's input and returns the answer
and the usage the endpoint reported — in one request, or, where the input offers tools, in the endpoint's own tool
calling, each call carried out by the runner, until the endpoint answers without one (the execution loop, Vibe Coding,
ch. 11); it sends the short test request of UC-003, which also tells whether the model calls a tool it is offered; and when a browser
cannot call an endpoint, it names the reason and the routes that would work instead (`AN UNSUPPORTED ENDPOINT SAYS SO`).
An endpoint the browser cannot call is called through the Bridge its configuration names, for UC-003's short test and
for the requests of jobs: MOD-bridge-jobs runs `testEndpoint` and `endpointDriver` in Node on that Bridge. Wherever it
runs, the driver calls the endpoint directly; it neither selects nor reaches a Bridge, which MOD-runtimes does. It runs
in a browser and in Node, and keeps nothing.

## Parts

- `index.mjs` — the interface.
- `openai-compatible.mjs` — requests and answers of OpenAI-compatible endpoints.
- `anthropic.mjs` — requests and answers of Anthropic endpoints.
- `diagnosis.mjs` — telling apart why a call failed.

## Data

**An endpoint's configuration**, as a browser keeps it in its store — where an endpoint the browser cannot call also
names its Bridge (MOD-browser-store) — and as CI gives it from the job's settings and secrets:

```json
{ "name": "nhr-hub", "kind": "openai-compatible", "baseUrl": "https://example.org/v1", "model": "example-model",
  "key": "…" }
```

The key is the endpoint's own, held in a browser's store or, in CI, read from the CI secret the participant names. A
direct call sends it only to the endpoint's own address in the request's authorisation header. For an endpoint called
through its Bridge — its test or a job's request —, the browser sends the configuration only in the body of the request
to that Bridge; the Bridge then sends the key only to the endpoint, in that endpoint request's authorisation header. It never appears in an
address and is never written anywhere (`A CREDENTIAL IS NEVER PLACED IN A URL`, `NO SECRET IN THE REPOSITORY`).

## Interfaces

- `EndpointConfig` — `{ name: string, kind: "openai-compatible" | "anthropic", baseUrl: string, model: string, key: string
  | null }`.
- `Diagnosis` — `{ reason: "cross-origin refused" | "opt-in header missing" | "blocked by the browser" | "not reachable" |
  "key refused" | "model unknown" | "too long" | "rate limited" | "endpoint error", message: string, routes: ("ci" |
  "bridge")[] }`: why a call failed, in the endpoint's or the browser's own words where there are any, and the routes on
  which the same job would work — GitHub Actions (UC-010) or the Bridge (UC-011) — where the browser was the obstacle.
- `endpointDriver(config: EndpointConfig, participant: Participant, exchange?: (config: EndpointConfig, exchange: {
  messages: object[], tools: object[] }) -> Promise<{ text: string, calls: object[], usage: Usage | null }>) -> Driver` — a
  driver whose `send` turns the
  `DriverInput` into a chat request to the endpoint, using `driverPrompt` once for its message text, crosses the network
  to it, and returns the answer's text and the
  usage the endpoint reported, or `null` usage where it reports none; it estimates nothing. Where the input carries
  `tools` (MOD-job-runner's `ToolUse`), it offers their definitions in the endpoint's own form — tools of an
  OpenAI-compatible endpoint, tool use of an Anthropic one —, hands each call the endpoint makes to `tools.call` and
  returns its result to the endpoint, and goes on until the endpoint answers without a call; that answer is the text it
  returns, and the usage is the sum of what each request reported. It makes at most `tools.limit` calls; at the limit it
  asks the endpoint once more for its answer without offering tools. A call's result that would carry the conversation
  past the participant's declared `context` — each message's size estimated as MOD-job-runner's `estimate` does — is not
  returned: the endpoint is told instead how large it is and how much of the context is left, so that it asks for a smaller
  part (UC-049 3a); a participant without a declared context sets no such bound. The driver decides nothing about a call: what a
  tool may do, and what it refuses, is the runner's. Each request of the loop is one `endpointExchange` — or one call of `exchange` where the caller gives it: MOD-runtimes'
  `bridgeDriver` gives the Bridge's `ask` of one exchange, so that the loop of an endpoint a Bridge calls is this same
  loop, run in the tab.
- `endpointExchange(config: EndpointConfig, exchange: { messages: { role: "user" | "assistant" | "tool", text: string,
  calls?: { id: string, name: string, args: object }[], callId?: string }[], tools: { name: string, description: string,
  input: object }[] }) -> Promise<{ text: string, calls: { id: string, name: string, args: object }[], usage: Usage | null
  }>` — one request of the loop, in the endpoint's own form: the messages so far and the tools offered, and back the
  endpoint's text, the tool calls it makes, and the usage it reported. It carries no call out. The Bridge calls it for an
  endpoint it reaches (MOD-bridge-jobs), so that the loop of a bridged endpoint runs in the tab, each request through the
  Bridge (MOD-runtimes' `bridgeDriver`). Crosses the network; throws `EndpointFailed { diagnosis }` as `endpointDriver`
  does. It throws `EndpointFailed {
  diagnosis }`: the endpoint answered with an error — its message kept, a refused key among them (UC-003) —, the browser
  blocked the call before it reached the endpoint, the network failed, or the endpoint refused the request for its length,
  which the runner reports as not fitting and never answers by cutting the input. One `send` is one exchange — one
  request, or the requests of its tool calls —; a failed request is not repeated by the driver. A cancel through the signal aborts the request.
- `testEndpoint(config: EndpointConfig) -> Promise<{ works: true, model: string, tools: boolean, toolMessage: string | null }
  | { works: false, diagnosis: Diagnosis }>` — sends one short request that offers the model one harmless tool and asks it
  to call it, across the network, and says whether the configuration works and whether the model called the tool —
  `tools` false where the endpoint refused the tool or answered without calling it, with its message where it gave one
  (UC-003 step 5, 5a); it changes nothing stored.
- `listModels(config: EndpointConfig) -> Promise<{ models: string[] } | { diagnosis: Diagnosis }>` — the identifiers of the
  models the endpoint serves, by its kind's own listing request (`GET <baseUrl>/models` for both kinds), with the key where
  the configuration has one; `config.model` is not read. It changes nothing stored. A failure is its `Diagnosis`, as
  `testEndpoint` gives it (UC-040, an endpoint's *Check*).
- `modelContext(config: EndpointConfig) -> Promise<number | null>` — the context in tokens of `config.model` as the endpoint
  states it: its entry in `GET <baseUrl>/models` (`context_length`, `max_model_len`, `max_input_tokens`, `context_window`,
  `max_context_length`, `top_provider.context_length`), else, for an OpenAI-compatible gateway, its entry in LiteLLM's
  `GET <baseUrl>/model/info`; with the key as `listModels` sends it. Null where the endpoint states none or a request
  fails. It changes nothing stored.
- `diagnoseEndpoint(error: unknown, config: EndpointConfig, where: "browser" | "node") -> Diagnosis` — names the reason of a
  failed call: a call a browser refused for want of a cross-origin permission or of the opt-in header a provider requires
  for calls from a browser, with the routes that would work instead; a refused key; an unknown model; a used-up rate
  limit; an unreachable address.

## Files

It reads and writes no file.

## Uses

- `MOD-job-runner.Driver`, `MOD-job-runner.DriverInput`, `MOD-job-runner.Usage` — the driver type it implements, its
  input, and the usage it returns; `MOD-job-runner.ToolUse` — the tools an input offers and how a call is carried out.
- `MOD-job-runner.driverPrompt` — the prepared prompt, current draft and canonical findings sent as one message.
- `MOD-participant-list.Participant` — the participant the driver stands for.
