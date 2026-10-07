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
  - MOD-job-runner.Usage
  - MOD-participant-list.Participant
provides:
  - EndpointConfig
  - Diagnosis
  - endpointDriver
  - testEndpoint
  - diagnoseEndpoint
---
# MOD-endpoint-calls The driver of model endpoints

## Responsibility

It belongs to Participants and jobs (ARC-046). It is the participant driver for model endpoints — OpenAI-compatible and
Anthropic, hosted or self-hosted — that a browser or Node calls directly: it sends a job's input as one request and
returns the answer and the usage the endpoint reported; it sends the short test request of UC-003; and when a browser
cannot call an endpoint, it names the reason and the routes that would work instead (`AN UNSUPPORTED ENDPOINT SAYS SO`).
For UC-003's short test of a model server reached through a Bridge, MOD-bridge-jobs invokes this module's public
`testEndpoint` in Node on that computer. Jobs of an agent on a Bridge remain MOD-runtimes' driver responsibility;
this short test creates no job and no driver. It runs in a browser and in Node, and keeps nothing.

## Parts

- `index.mjs` — the interface.
- `openai-compatible.mjs` — requests and answers of OpenAI-compatible endpoints.
- `anthropic.mjs` — requests and answers of Anthropic endpoints.
- `diagnosis.mjs` — telling apart why a call failed.

## Data

**An endpoint's configuration**, as a browser keeps it in its store and as CI gives it from the job's settings and
secrets:

```json
{ "name": "nhr-hub", "kind": "openai-compatible", "baseUrl": "https://example.org/v1", "model": "example-model",
  "key": "…" }
```

The key is the endpoint's own, held in a browser's store or, in CI, read from the CI secret the participant names; it is
sent to the endpoint's own address in its authorisation header. For UC-003 throughBridge, the browser first sends
EndpointConfig, including its key, only in the paired Bridge request's JSON body; the Bridge holds it only for that
short test and sends it to the endpoint in the same header. Neither hop puts a credential in an address
(`A CREDENTIAL IS NEVER PLACED IN A URL`), log or repository (`NO SECRET IN THE REPOSITORY`).

## Interfaces

- `EndpointConfig` — `{ name: string, kind: "openai-compatible" | "anthropic", baseUrl: string, model: string, key: string
  | null }`.
- `Diagnosis` — `{ reason: "cross-origin refused" | "opt-in header missing" | "blocked by the browser" | "not reachable" |
  "key refused" | "model unknown" | "too long" | "rate limited" | "endpoint error", message: string, routes: ("ci" |
  "bridge")[] }`: why a call failed, in the endpoint's or the browser's own words where there are any, and the routes on
  which the same job would work — GitHub Actions (UC-010) or the Bridge (UC-011) — where the browser was the obstacle.
- `endpointDriver(config: EndpointConfig, participant: Participant) -> Driver` — a driver whose `send` turns the
  `DriverInput` into one chat request to the endpoint, crosses the network to it, and returns the answer's text and the
  usage the endpoint reported, or `null` usage where it reports none; it estimates nothing. It throws `EndpointFailed {
  diagnosis }`: the endpoint answered with an error — its message kept, a refused key among them (UC-003) —, the browser
  blocked the call before it reached the endpoint, the network failed, or the endpoint refused the request for its length,
  which the runner reports as not fitting and never answers by cutting the input. One `send` is one request; a failed
  request is not repeated by the driver. A cancel through the signal aborts the request.
- `testEndpoint(config: EndpointConfig) -> Promise<{ works: true, model: string } | { works: false, diagnosis: Diagnosis
  }>` — sends one short request that asks for a one-word answer, across the network, and says whether the configuration
  works; it changes nothing stored.
- `diagnoseEndpoint(error: unknown, config: EndpointConfig, where: "browser" | "node") -> Diagnosis` — names the reason of a
  failed call: a call a browser refused for want of a cross-origin permission or of the opt-in header a provider requires
  for calls from a browser, with the routes that would work instead; a refused key; an unknown model; a used-up rate
  limit; an unreachable address.

## Files

It reads and writes no file.

## Uses

- `MOD-job-runner.Driver`, `MOD-job-runner.DriverInput`, `MOD-job-runner.Usage` — the driver type it implements, its
  input, and the usage it returns.
- `MOD-participant-list.Participant` — the participant the driver stands for.
