---
id: ARC-009
title: Participants are reached behind one driver interface — model endpoints from the browser, CI agents by workflow dispatch, CLI agents through the bridge
forced_by:
  - A PARTICIPANT HAS ONE OF FIVE TYPES
  - ONE DEFINITION, THREE DRIVERS
  - A RUNTIME IS INTERCHANGEABLE
  - AN UNSUPPORTED ENDPOINT SAYS SO
  - A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
  - A LOCAL AGENT USES THE PERSON'S OWN LOGIN
  - THE BRIDGE FINDS THE INSTALLED AGENTS
  - A SELF-HOSTED RUNNER SERVES AGENT M ONLY FROM A PRIVATE REPOSITORY
  - NO COST IS GUESSED
  - A REUSE DECISION RECORDS ITS DUE DILIGENCE
  - UC-003
  - UC-010
  - UC-011
  - UC-017
---
# ARC-009 Participants behind one driver interface

## Context

A participant is a person, a model endpoint, a CI agent, a CLI agent on a machine, or a sandboxed
agent (`A PARTICIPANT HAS ONE OF FIVE TYPES`). The harness (ARC-008) and the run engine (ARC-010)
must not care which. Each non-person type is reached differently: an endpoint by HTTPS from the
browser, a CI agent through a workflow on the git server, a CLI or sandboxed agent through the
bridge (ARC-011, ARC-012). Book ch. 10: the plug-in pattern — a stable extension contract, with
each plug-in behind it.

## Decision

**One interface, three implementations.** A driver is an object with:

- `describe()` — type, processing place, capabilities, where it runs (for the run panel);
- `send(job, message) -> answer` — one turn for drafting jobs (used by the harness);
- `start(job) -> handle`, `state(handle)`, `log(handle)`, `cancel(handle)` — for jobs that run on
  their own (implementation, test generation, CI generation);
- every call returns the cost or usage when the runtime reports one, and nothing otherwise
  (`NO COST IS GUESSED`).

1. **Model endpoint (`MOD-participant-endpoint`)** — from the browser, two wire formats: the
   OpenAI-compatible chat-completions format and the Anthropic Messages format. For Anthropic the
   request carries the header `anthropic-dangerous-direct-browser-access: true`, which the official
   TypeScript SDK sets when `dangerouslyAllowBrowser` is on (read 2026-09-30 in
   `https://raw.githubusercontent.com/anthropics/anthropic-sdk-typescript/main/src/client.ts`). No
   SDK is vendored: two request shapes over `fetch` are smaller than either SDK and keep the key's
   route inside the adapter. A refused cross-origin call is named with its reason and the runtimes
   that would work (`AN UNSUPPORTED ENDPOINT SAYS SO`).
2. **CI agent (`MOD-participant-ci`)** — a `workflow_dispatch` of Agent M's job workflow in the
   product repository (GitHub) or a pipeline trigger (GitLab), with the job identifier as input. The
   workflow checks out Agent M's definitions, runs the same core with Node, and authenticates the
   agent with a CI secret it names and never receives (`A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI
   SECRET`). A self-hosted runner is used only when the git server reports the repository as private.
3. **CLI agent and sandboxed agent (`MOD-participant-cli`)** — a request to the bridge, which runs
   the agent with its own login (`A LOCAL AGENT USES THE PERSON'S OWN LOGIN`). Three agents,
   invoked as their documentation describes (read 2026-09-30):
   - Claude Code: `claude -p "<prompt>" --output-format json`; the JSON includes `total_cost_usd`,
     which the documentation calls a client-side estimate
     (`https://code.claude.com/docs/en/headless.md`);
   - Codex: `codex exec --json "<prompt>"`; stdout is JSON Lines with `turn.completed` events that
     carry token `usage`, no cost (`https://developers.openai.com/codex/noninteractive.md`);
   - opencode: `opencode serve` starts a headless HTTP server with an OpenAPI description, default
     `--hostname 127.0.0.1 --port 4096` (`https://opencode.ai/docs/server/`).
   A sandboxed agent is the same driver talking to a bridge at the tunnel's local address.

### Due diligence of the three agent CLIs (read 2026-09-30)

Sources as in ARC-002 (npm registry, npm downloads API, GitHub API). Agent M does not redistribute
any of them; the person installs them (`THE BRIDGE GUIDES THE INSTALLATION OF A MISSING AGENT`).

| Agent | Licence | Against MIT | Releases | Issues | Adoption |
|---|---|---|---|---|---|
| Claude Code (`@anthropic-ai/claude-code`, anthropics/claude-code) | proprietary: `LICENSE.md` "© Anthropic PBC. All rights reserved. Use is subject to Anthropic's Commercial Terms of Service"; npm field `SEE LICENSE IN README.md` | **marked — not compatible for redistribution**; used only as the person's own installation | first 2025-02-24, latest 2.1.285 on 2026-09-29, 315 versions in 12 months | 13 121 open, 82 504 closed, 78 018 closed and 87 506 opened in 12 months | 54 078 057 downloads last month; 148 688 stars |
| Codex (`@openai/codex`, openai/codex) | Apache-2.0 | compatible | first 2025-04-16, latest 0.159.2 on 2026-09-30, 5 053 versions in 12 months | 19 624 open, 11 597 closed, 10 583 closed and 29 321 opened in 12 months | 87 380 253; 127 396 stars |
| opencode (`opencode-ai`, anomalyco/opencode) | MIT | compatible | first 2025-05-31, latest 1.18.33 on 2026-09-28, 10 650 versions in 12 months | 4 747 open, 23 587 closed, 22 476 closed and 26 464 opened in 12 months | 9 369 030; 211 114 stars |

## Alternatives

- **One agent only** — rejected: `THE BRIDGE FINDS THE INSTALLED AGENTS` names three; the person
  already pays for one of them.
- **The vendors' SDKs in the browser** (Anthropic, OpenAI) — rejected for the reasons in point 1;
  they would also add their own key handling beside the settings store (ARC-005).
- **A CI agent reached by SSH from GitHub's machines** — rejected: it needs an SSH key stored on
  GitHub and a host reachable from the internet; the self-hosted runner connects out and needs
  neither (UC-017 3b).
- **Agent Client Protocol or MCP as the one wire protocol to all agents** — not chosen now: the
  three CLIs document the invocations above; a common protocol would be a second adapter layer
  without a present need (YAGNI). Revisit when two of them document the same protocol.

## Consequences

- Each CLI's output format is a moving target: all three release several times a week (table
  above). The CLI driver keeps one small parser per agent, each with a recorded-output fixture
  (`COMMIT TESTS CALL NO PAID SERVICE`); a parse failure is reported as such, never as an empty
  result.
- The cost reported by Claude Code is an estimate by the tool; the job record labels it with its
  source. Codex reports usage only; its cost stays unknown unless the participant declares a price.
- **Open measurement — endpoint CORS.** Which endpoints answer a browser call from a Pages origin is
  measured per endpoint and recorded in `docs/measurements/` before the endpoint driver is released
  (`BROWSER REACHABILITY IS MEASURED, NOT ASSUMED`): at least api.anthropic.com with the header
  above, api.openai.com, and one self-hosted OpenAI-compatible gateway.

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; open until accepted.*
