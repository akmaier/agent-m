---
id: MOD-participant-cli
title: Finds, runs and parses local coding agents — Claude Code, Codex, opencode
realises:
  - THE BRIDGE FINDS THE INSTALLED AGENTS
  - THE BRIDGE GUIDES THE INSTALLATION OF A MISSING AGENT
  - A LOCAL AGENT USES THE PERSON'S OWN LOGIN
  - A RUNTIME IS INTERCHANGEABLE
  - UC-011
  - UC-024
  - UC-044
follows:
  - ARC-009
  - ARC-011
  - ARC-012
uses:
  - MOD-bridge-server.bridgeClient
provides:
  - driver
  - detectAgents
  - runAgent
  - parseAgentOutput
  - installGuide
---
# MOD-participant-cli Finds, runs and parses local coding agents — Claude Code, Codex, opencode

## Responsibility

The CLI-agent driver of ARC-009 and the bridge's agent runner. The same module runs in the browser
(forwarding to the bridge) and in the bridge (starting the agent with its own login).

**Current state.** No code exists.

## Interfaces

- `driver(participant) -> { describe(), send(job, messages), start(job), state(h), log(h), cancel(h) }` — the browser side: the same calls, forwarded to the bridge that hosts the agent.
- `detectAgents(env) -> [{ agent, path, version }]` — the bridge side: which of `claude`, `codex`, `opencode` are on the path, with their version; only these are offered.
- `runAgent(job, agent) -> handle` — the bridge side: starts `claude -p … --output-format json`, `codex exec --json …` or talks to `opencode serve` on loopback, in the job's working copy, with no key argument and no key variable in its environment.
- `parseAgentOutput(agent, output) -> { result, cost?, usage? }` — one parser per agent, each with a recorded fixture; an unreadable output is reported, never taken as empty.
- `installGuide(agent, platform) -> { url, steps }` — the vendor's instructions for a missing agent; nothing is installed by the bridge.

Uses, as declared above: `MOD-bridge-server.bridgeClient`.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
