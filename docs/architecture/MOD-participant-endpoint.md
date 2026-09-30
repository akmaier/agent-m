---
id: MOD-participant-endpoint
title: Calls model endpoints — hosted ones from the browser, OpenAI-compatible or Anthropic Messages, and local model servers through the bridge
realises:
  - AN UNSUPPORTED ENDPOINT SAYS SO
  - BROWSER REACHABILITY IS MEASURED, NOT ASSUMED
  - A PARTICIPANT HAS ONE OF FIVE TYPES
  - THE LOCAL BRIDGE REQUIRES A TOKEN
  - NO COST IS GUESSED
  - UC-003
  - UC-017
follows:
  - ARC-003
  - ARC-009
  - ARC-012
uses:
  - MOD-settings-store.browserStore
  - MOD-bridge-server.bridgeClient
provides:
  - driver
  - diagnoseEndpoint
  - localEndpointRoute
---
# MOD-participant-endpoint Calls model endpoints — hosted ones from the browser, OpenAI-compatible or Anthropic Messages, and local model servers through the bridge

## Responsibility

The model-endpoint driver of ARC-009, with two routes. A hosted endpoint is called from the browser,
and its key goes only to that endpoint. A local model server — Ollama, vLLM, LiteLLM or another
OpenAI-compatible server on a bridge's machine — is called by that bridge on the same machine; the
browser reaches the bridge on loopback or over the HTTPS route through the jump host (ARC-012), so no
browser CORS rule and no `OLLAMA_ORIGINS` applies. The same module runs in the browser (the driver)
and in the bridge (the route that forwards).

**Current state.** No code exists; the endpoint settings keys are to be added to MOD-settings-store,
the local servers to the bridge's own settings (MOD-bridge-app).

## Interfaces

- `driver(endpointConfig) -> { describe(), send(job, messages) }` — one turn to an OpenAI-compatible chat-completions or an Anthropic Messages endpoint (with `anthropic-dangerous-direct-browser-access: true`); route *browser*: the key only in that endpoint's header; route *bridge*: the same request to `POST /endpoint/chat` of the bridge through `MOD-bridge-server.bridgeClient`, naming the local server by its name in the bridge's settings; usage returned as reported.
- `diagnoseEndpoint(config) -> { ok } | { reason, alternatives }` — one short test request; a refused cross-origin call named as such, with the CI route and — for a server on the person's own machine — the bridge route that would work; for the bridge route, `GET /endpoint/models` lists the served models.
- `localEndpointRoute(servers) -> { "GET /endpoint/models", "POST /endpoint/chat" }` — the bridge side: the handlers the bridge app mounts; each forwards only to a server address from the bridge's own settings that is a loopback address, never to an address the request names; a server key travels in the request body and goes only to that server; nothing of the prompt or answer is logged.

Uses, as declared above: `MOD-settings-store.browserStore`, `MOD-bridge-server.bridgeClient`.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-09-30 by Claude (claude-opus-5-5) against commit 1110607b6dc4d9c888549a23a680fbe4b38dd3f1 — SPEC and use cases as accepted that day, and `docs/measurements/2026-09-30_architecture-open-points.md`; open until accepted.*
