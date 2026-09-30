---
id: ARC-009
title: Participants are reached behind one driver interface — hosted model endpoints from the browser, local model servers and CLI agents through the bridge, CI agents by workflow dispatch
forced_by:
  - A PARTICIPANT HAS ONE OF FIVE TYPES
  - ONE DEFINITION, THREE DRIVERS
  - A RUNTIME IS INTERCHANGEABLE
  - AN UNSUPPORTED ENDPOINT SAYS SO
  - BROWSER REACHABILITY IS MEASURED, NOT ASSUMED
  - A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
  - A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
  - A LOCAL AGENT USES THE PERSON'S OWN LOGIN
  - THE BRIDGE FINDS THE INSTALLED AGENTS
  - THE LOCAL BRIDGE REQUIRES A TOKEN
  - A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST
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
must not care which. Each non-person type is reached differently: an endpoint by HTTPS, a CI agent
through a workflow on the git server, a CLI or sandboxed agent through the bridge (ARC-011, ARC-012).
Book ch. 10: the plug-in pattern — a stable extension contract, with each plug-in behind it.

What the endpoints and SDKs document about calls from a web page was read on 2026-09-30 and is recorded
in `docs/measurements/2026-09-30_architecture-open-points.md`, point 7 (*measurement §7*):

- **Anthropic** — the SDK allows browsers only on request: "Enable browser support by explicitly
  setting `dangerouslyAllowBrowser` to `true`."
  (`https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/typescript.md`), and then sends
  `'anthropic-dangerous-direct-browser-access': 'true'`
  (`https://github.com/anthropics/anthropic-sdk-typescript/blob/main/src/client.ts`). The header's name
  appears in neither that page nor the API overview. The server's CORS answer is not documented.
- **OpenAI** — the SDK: "Web browsers: disabled by default to avoid exposing your secret API
  credentials." (`https://github.com/openai/openai-node/blob/master/README.md`); it sends no extra
  header. No CORS statement was found in OpenAI's documentation; on 2025-10-15 OpenAI staff wrote about
  missing CORS answers "Yes, I can confirm this is a bug"
  (`https://community.openai.com/t/chat-completions-api-endpoint-down-blocked-any-web-browser-request/1362527`).
- **LiteLLM proxy** — `LITELLM_CORS_ORIGINS` "Defaults to * (all origins) when not set"
  (`https://docs.litellm.ai/docs/proxy/config_settings`).
- **vLLM OpenAI server** — "--allowed-origins ¶ Allowed origins. Default: ['*']"
  (`https://docs.vllm.ai/en/latest/cli/serve/`).
- **Ollama** — "Ollama allows cross-origin requests from `127.0.0.1` and `0.0.0.0` by default.";
  "Additional origins can be configured with `OLLAMA_ORIGINS`."
  (`https://raw.githubusercontent.com/ollama/ollama/main/docs/faq.mdx`).

A model server on the person's own machine is a loopback destination for the browser, so ARC-012's
browser matrix would apply to it too — one prompt in Chrome, Edge and Firefox, blocked in Safari — and
Ollama would additionally need `OLLAMA_ORIGINS` set to the Pages origin by the person.

## Decision

**One interface, four routes.** A driver is an object with:

- `describe()` — type, processing place, capabilities, where it runs (for the run panel);
- `send(job, message) -> answer` — one turn for drafting jobs (used by the harness);
- `start(job) -> handle`, `state(handle)`, `log(handle)`, `cancel(handle)` — for jobs that run on
  their own (implementation, test generation, CI generation);
- every call returns the cost or usage when the runtime reports one, and nothing otherwise
  (`NO COST IS GUESSED`).

1. **Hosted model endpoint (`MOD-participant-endpoint`, route *browser*)** — from the browser, two wire
   formats: the OpenAI-compatible chat-completions format and the Anthropic Messages format. For
   Anthropic the request carries `anthropic-dangerous-direct-browser-access: true`, as the SDK source
   above sets it. No SDK is vendored: two request shapes over `fetch` are smaller than either SDK and
   keep the key's route inside the adapter. A refused cross-origin call is named with its reason and the
   routes that would work — CI, or the bridge (`AN UNSUPPORTED ENDPOINT SAYS SO`).
2. **Local model server (`MOD-participant-endpoint`, route *bridge*)** — Ollama, vLLM, LiteLLM or any
   OpenAI-compatible server on the machine of a bridge is reached **through that bridge**, which calls
   it on the same machine. The browser sends the same request shape to the bridge (`POST
   /endpoint/chat`, ARC-012) with the bridge token; the bridge forwards it to the server address named
   in the bridge's own settings, which must be a loopback address, and returns the answer. No browser
   CORS rule and no `OLLAMA_ORIGINS` applies: the bridge is not a browser. The browser reaches the bridge
   directly on loopback, or — in Safari, or for a bridge on another machine — over the HTTPS route
   through the jump host (ARC-012 point 9). A server key, where one is needed, goes in the request body
   to the bridge and from there only to that server.
3. **CI agent (`MOD-participant-ci`)** — a `workflow_dispatch` of Agent M's job workflow in the
   product repository (GitHub) or a pipeline trigger (GitLab), with the job identifier as input. The
   workflow checks out Agent M's definitions, runs the same core with Node, authenticates the agent with
   a CI secret it names and never receives (`A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET`),
   and pushes, opens and merges pull requests with the person's Agent M token from a second named CI
   secret, never with the workflow's built-in token (`A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A
   CI SECRET`, ARC-015). A self-hosted runner is used only when the git server reports the repository as
   private.
4. **CLI agent and sandboxed agent (`MOD-participant-cli`)** — a request to the bridge, which runs
   the agent with its own login (`A LOCAL AGENT USES THE PERSON'S OWN LOGIN`). Three agents,
   invoked as their documentation describes (read 2026-09-30):
   - Claude Code: `claude -p "<prompt>" --output-format json`; the JSON includes `total_cost_usd`,
     which the documentation calls a client-side estimate
     (`https://code.claude.com/docs/en/headless.md`);
   - Codex: `codex exec --json "<prompt>"`; stdout is JSON Lines with `turn.completed` events that
     carry token `usage`, no cost (`https://developers.openai.com/codex/noninteractive.md`);
   - opencode: `opencode serve` starts a headless HTTP server with an OpenAPI description, default
     `--hostname 127.0.0.1 --port 4096` (`https://opencode.ai/docs/server/`).
   A sandboxed agent is the same driver talking to a bridge at the tunnel's local address or its HTTPS
   route.

### Due diligence of the three agent CLIs (read 2026-09-30)

Sources as in ARC-002 (npm registry, npm downloads API, GitHub API). Agent M does not redistribute
any of them; the person installs them (`THE BRIDGE GUIDES THE INSTALLATION OF A MISSING AGENT`).

| Agent | Licence | Against MIT | Releases | Issues | Adoption |
|---|---|---|---|---|---|
| Claude Code (`@anthropic-ai/claude-code`, anthropics/claude-code) | proprietary: `LICENSE.md` "© Anthropic PBC. All rights reserved. Use is subject to Anthropic's Commercial Terms of Service"; npm field `SEE LICENSE IN README.md` | **marked — not compatible for redistribution**; used only as the person's own installation | first 2025-02-24, latest 2.1.285 on 2026-09-29, 315 versions in 12 months | 13 121 open, 82 504 closed, 78 018 closed and 87 506 opened in 12 months | 54 078 057 downloads last month; 148 688 stars |
| Codex (`@openai/codex`, openai/codex) | Apache-2.0 | compatible | first 2025-04-16, latest 0.159.2 on 2026-09-30, 5 053 versions in 12 months | 19 624 open, 11 597 closed, 10 583 closed and 29 321 opened in 12 months | 87 380 253; 127 396 stars |
| opencode (`opencode-ai`, anomalyco/opencode) | MIT | compatible | first 2025-05-31, latest 1.18.33 on 2026-09-28, 10 650 versions in 12 months | 4 747 open, 23 587 closed, 22 476 closed and 26 464 opened in 12 months | 9 369 030; 211 114 stars |

The local model servers of decision 2 are not reused by Agent M: the person runs them, and Agent M
speaks the OpenAI-compatible request shape to them. No due diligence is recorded for them here; a
product that uses one declares it as a resource (UC-040).

## Alternatives

- **Local model servers called directly from the browser** — rejected: the browser treats them as
  loopback — blocked in Safari, one prompt elsewhere (ARC-012) —, and Ollama answers only `127.0.0.1`
  and `0.0.0.0` until the person sets `OLLAMA_ORIGINS` (measurement §7): a configuration step on each
  machine, and a server-side permission for every page of the owner's Pages origin. Through the bridge
  neither is needed.
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
- The bridge forwards only to loopback addresses from its own settings, so a page that holds a bridge
  token cannot use the bridge to reach other hosts on the person's network.
- A local model server used by a participant needs the bridge — Agent M's second level (UC-044). A
  self-hosted gateway on another host (LiteLLM, vLLM) answers any origin by default and stays a
  browser-route endpoint.
- **Open measurement — hosted endpoint CORS.** The actual CORS answers of `api.anthropic.com` (with and
  without the header) and of `api.openai.com` are not documented; measurement: a preflight from
  `Origin: https://akmaier.github.io` to each `/v1/…` endpoint in the form of
  `docs/measurements/2026-09-30_gitlab-cors.md`, and one real browser call with a test key, recorded
  before the endpoint driver is released (`BROWSER REACHABILITY IS MEASURED, NOT ASSUMED`).

*Drafted on 2026-09-30 by Claude (claude-opus-5-5) for the Agent M repository at commit 1605b2dcfe907fb1df6e394af3fdbec80f379dbc; revised on 2026-09-30 by Claude (claude-opus-5-5) against commit 1110607b6dc4d9c888549a23a680fbe4b38dd3f1 — SPEC and use cases as accepted that day, and `docs/measurements/2026-09-30_architecture-open-points.md`; open until accepted.*
