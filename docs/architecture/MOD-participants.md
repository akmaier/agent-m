---
id: MOD-participants
title: Model endpoints and local coding agents behind the driver interface — from the browser, and inside the bridge
realises:
  - AN UNSUPPORTED ENDPOINT SAYS SO
  - THE BRIDGE FINDS THE INSTALLED AGENTS
  - THE BRIDGE GUIDES THE INSTALLATION OF A MISSING AGENT
  - A LOCAL AGENT USES THE PERSON'S OWN LOGIN
  - UC-003
  - UC-011
follows:
  - ARC-003
  - ARC-009
  - ARC-011
  - ARC-012
uses:
  - MOD-bridge-server.bridgeClient
provides:
  - endpointDriver
  - cliDriver
  - diagnoseEndpoint
  - endpointRoutes
  - agentRoutes
  - detectAgents
  - installGuide
---
# MOD-participants Model endpoints and local agents behind the driver interface

## Responsibility

Adapter. The participants of ARC-009 that answer through a model or an agent, behind the one driver
interface: a hosted model endpoint called from the browser in the OpenAI-compatible or the Anthropic
Messages format, a local model server called by the bridge on its own machine, and a coding agent —
Claude Code, Codex, opencode — run by the bridge with the login it already has. The browser side reaches
the bridge through the generic bridge client; the bridge side provides the handlers the bridge app mounts.
A participant's configuration — endpoint, model, key, bridge route — is passed in by the caller; this
module reads no store. A key goes only to its own endpoint.

## Interfaces

- `endpointDriver(config) -> { describe(), send(job, messages) }` — one turn to an OpenAI-compatible chat-completions or an Anthropic Messages endpoint (with `anthropic-dangerous-direct-browser-access: true`); route *browser*: the key only in that endpoint's header; route *bridge*: the same request to `POST /endpoint/chat` of the bridge, naming the local server by its name in the bridge's settings; usage returned as reported, never estimated.
- `cliDriver(participant, route) -> { describe(), send(job, messages), start(job), state(h), log(h), cancel(h) }` — a CLI or sandboxed agent: from the browser, the calls forwarded to the bridge that hosts it, on loopback or over the HTTPS route of ARC-013; in CI or in the bridge, the agent run directly.
- `diagnoseEndpoint(config) -> { ok } | { reason, alternatives }` — one short test request; a refused cross-origin call named as such, with the CI route and — for a server on the person's own machine — the bridge route that would work.
- `endpointRoutes(servers) -> { "GET /endpoint/models", "POST /endpoint/chat" }` — the bridge side: the handlers the bridge app mounts; each forwards only to a server address from the bridge's own settings that is a loopback address, never to an address the request names; a server key travels in the request body and goes only to that server; nothing of the prompt or answer is logged.
- `agentRoutes(agents) -> { "GET /agents", "POST /jobs", "GET /jobs", "GET /jobs/<id>", "GET /jobs/<id>/log", "DELETE /jobs/<id>" }` — the bridge side: starts `claude -p … --output-format json`, `codex exec --json …` or talks to `opencode serve` on loopback, in the job's working copy, with no key argument and no key variable in its environment; each agent's output read by one parser with a recorded fixture, an unreadable output reported, never taken as empty.
- `detectAgents(env) -> [{ agent, path, version }]` — which of `claude`, `codex`, `opencode` are on the path, with their version; only these are offered.
- `installGuide(agent, platform) -> { url, steps }` — the vendor's instructions for a missing agent; nothing is installed by the bridge.

## Testing

Component tests with recorded responses: a fake `fetch` that records every request checks that a key goes
only to its own endpoint and that a refused preflight is named (`tests/test_endpoint_diagnosis.py`); fixture
executables on `PATH` stand in for the three agents (`tests/test_bridge_agents.py`) — exactly the
installed ones are listed, and the command started carries no key; one recorded output per agent and
version feeds its parser, with a broken output as counter-proof. The seams are `fetch`, the process
spawner and the environment. No test calls a paid endpoint on a commit (`COMMIT TESTS CALL NO PAID
SERVICE`); a real call per endpoint kind runs nightly with a CI secret. The hosted endpoints' CORS answers
are a measurement before release (ARC-009). Quality of the answers is no concern of this module.

*Drafted on 2026-10-01 by Claude (claude-opus-5-5) for the Agent M repository at commit d0e5631081876203e719a2508d673d904e7768db — the leaner architecture of the architecture review, as the PO approved it (UC-023): MOD-participant-endpoint and MOD-participant-cli in one adapter, configuration passed in; open until accepted.*
