---
id: MOD-participant-endpoint
title: Calls model endpoints from the browser, OpenAI-compatible or Anthropic Messages
realises:
  - AN UNSUPPORTED ENDPOINT SAYS SO
  - BROWSER REACHABILITY IS MEASURED, NOT ASSUMED
  - A PARTICIPANT HAS ONE OF FIVE TYPES
  - NO COST IS GUESSED
  - UC-003
follows:
  - ARC-003
  - ARC-009
uses:
  - MOD-settings-store.browserStore
provides:
  - driver
  - diagnoseEndpoint
---
# MOD-participant-endpoint Calls model endpoints from the browser, OpenAI-compatible or Anthropic Messages

## Responsibility

The model-endpoint driver of ARC-009. It runs in the browser and sends an endpoint's key only to
that endpoint.

**Current state.** No code exists; the endpoint settings keys are to be added to MOD-settings-store.

## Interfaces

- `driver(endpointConfig) -> { describe(), send(job, messages) }` — one turn to an OpenAI-compatible chat-completions or an Anthropic Messages endpoint (with `anthropic-dangerous-direct-browser-access: true`); the key only in that endpoint's header; usage returned as reported.
- `diagnoseEndpoint(config) -> { ok } | { reason, alternatives }` — one short test request; a refused cross-origin call named as such, with the CI and bridge runtimes that would work.

Uses, as declared above: `MOD-settings-store.browserStore`.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
