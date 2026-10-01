---
id: ITM-101
title: The bridge's agent and local-model-server routes — agents found, run with their own login, installation guided
kind: implementation
level: 2
realises:
  - THE BRIDGE FINDS THE INSTALLED AGENTS
  - A LOCAL AGENT USES THE PERSON'S OWN LOGIN
  - THE BRIDGE GUIDES THE INSTALLATION OF A MISSING AGENT
modules:
  - MOD-participants
depends_on:
  - ITM-099
  - ITM-064
origin: backlog refinement 2026-10-01
---
# ITM-101 The bridge's agent and local-model-server routes — agents found, run with their own login, installation guided

**REGISTER**

## Outcome

`detectAgents`, `installGuide`, `agentRoutes` (`claude -p … --output-format json`, `codex exec --json …`, `opencode serve` on loopback; no key argument or variable; one parser per agent with a recorded fixture) and `endpointRoutes` (forwarding only to loopback servers from the bridge's own settings).

## Realises

- `THE BRIDGE FINDS THE INSTALLED AGENTS`
- `A LOCAL AGENT USES THE PERSON'S OWN LOGIN`
- `THE BRIDGE GUIDES THE INSTALLATION OF A MISSING AGENT`

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-participants (takes over the withdrawn MOD-participant-cli); ARC-009 decisions 2, 4.

Architecture decisions its modules follow: ARC-003, ARC-009, ARC-011, ARC-012.

## Modules

- MOD-participants (adapters) — uses MOD-bridge-server

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/participants/bridge-routes.mjs` (new)
- `tests/test_bridge_agents.py`
- `tests/fixtures/agents/` (fixture executables, recorded outputs)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **2** — needs the Agent M Bridge on a person's computer.

## Tests the SPEC names

- `tests/test_bridge_agents.py` — `THE BRIDGE FINDS THE INSTALLED AGENTS`; `A LOCAL AGENT USES THE PERSON'S OWN LOGIN`
- guarded at review only: `THE BRIDGE GUIDES THE INSTALLATION OF A MISSING AGENT`

## Acceptance criteria

From the SPEC's checks:

- `THE BRIDGE FINDS THE INSTALLED AGENTS` — `tests/test_bridge_agents.py` — with fixture executables on the path, exactly those are listed.
- `A LOCAL AGENT USES THE PERSON'S OWN LOGIN` — `tests/test_bridge_agents.py` — the command the bridge starts carries no key and no key environment variable.
- `THE BRIDGE GUIDES THE INSTALLATION OF A MISSING AGENT` — no automatic check; at review.

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-099 — the route table's protocol
- ITM-064 — the endpoint request shape

## Needs a person

No.

## From the sprint 01 review

ITM-008 named `tests/test_bridge_agents.py` for `A LOCAL AGENT USES THE PERSON'S OWN LOGIN` but could not write it inside
MOD-git-host and MOD-dashboard-app; it built the write path's `agent-login` authority kind and a repository check that
only the bridge app makes one (`docs/measurements/2026-10-01_one-write-path-with-an-authority.md`; pull request #37,
*Acceptance criteria not met here*). This item writes that check, as the SPEC words it — the command the bridge starts
carries no key and no key environment variable —, and so closes the part ITM-008 left open for it. A write that follows
from an agent's run, made with the `agent-login` authority, belongs to the item that runs the bridge's queued jobs
(ITM-106), whose module MOD-bridge-app makes that authority. (Sprint 01 review, `docs/backlog/sprints/sprint-01.md`,
feedback 10.)
