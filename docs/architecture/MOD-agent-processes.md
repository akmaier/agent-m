---
id: MOD-agent-processes
title: Coding-agent CLIs as processes on a machine
folder: src/agent-processes/
realises:
follows:
  - ARC-046
uses:
  - MOD-job-runner.Driver
  - MOD-job-runner.DriverInput
  - MOD-job-runner.Usage
  - MOD-participant-list.Participant
  - MOD-documents.loadSchema
  - MOD-documents.readRegister
provides:
  - Agent
  - installedAgents
  - agentDriver
  - testAgent
---
# MOD-agent-processes Coding-agent CLIs as processes on a machine

## Responsibility

It belongs to Participants and jobs (ARC-046). It knows the coding-agent CLIs Agent M supports — Claude Code, Codex and
opencode —: which of them are installed on the machine it runs on, with their versions (`THE BRIDGE FINDS THE INSTALLED
AGENTS`), and how to run one as a participant: the driver that gives an agent its task in a working folder, streams its
output, and stops it on a cancel. The agent works with the login it already has on the machine (`A LOCAL AGENT USES THE
PERSON'S OWN LOGIN`); in CI it reads its key from the environment variable the CI fills from the secret the participant
names (`A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET`). It runs in Node only — inside the Bridge and in the
Workflows — and keeps nothing but the processes it started.

## Parts

- `index.mjs` — the interface.
- `agents.md` — the supported agents, as a register.
- `agents.schema.md` — the register's schema, in the schema language of MOD-documents.
- `discovery.mjs` — finding the installed agents and their versions.
- `processes.mjs` — starting an agent, streaming its output, stopping it.

## Data

**The supported agents**, `agents.md`, a register read with MOD-documents:

| Column | What it holds |
|---|---|
| Agent | the name by which a participant names the agent, one row per supported agent: `claude`, `codex`, `opencode` |
| Command | the command the CLI is started by |
| Version | how its version is asked for |
| Task | how a task is given to it without a conversation, and how its final answer is told from its other output |
| Login check | how it is asked, harmlessly, whether it is logged in |
| Key variable | the environment variable from which it reads a key, used only in CI |
| Install | the vendor's installation page for each platform (`THE BRIDGE GUIDES THE INSTALLATION OF A MISSING AGENT`) |

The exact commands and options are data in this register, not code, so a changed CLI is a changed row.

## Interfaces

- `Agent` — `{ name: string, installed: boolean, version: string | null, loggedIn: boolean | null, install:
  Record<"macos" | "windows" | "linux", string> }`: `name` is the Agent of a row of `agents.md`, so that a supported
  agent added is a row added, not a change of this interface (`OPEN FOR EXTENSION, CLOSED FOR CHANGE`).
- `installedAgents() -> Promise<Agent[]>` — every supported agent, each found on the machine's path with its version, or
  marked as missing with its vendor's installation page; an installed agent that is not logged in is marked so, and the
  agent's own login step is named — this module never asks for a password (UC-044). Starts only the commands of the
  register's Version and Login check columns; changes nothing.
- `agentDriver(agent: Agent, options: { workdir: string, keyVariable: string | null }, participant: Participant) ->
  Driver` — a driver whose `send` starts the agent with the input as its task in the working folder, streams its output
  through `onOutput`, and returns its final answer and the usage it reported, or `null` usage. For a job that works in the
  folder — implementing, fixing, generating tests —, the agent commits, pushes and opens its pull request itself with the
  git credentials of its machine — the computer's own login on a Bridge, the person's token from a CI secret in CI
  (`A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET`) —, and its answer reports what it did. Outside CI, `keyVariable` is `null`: the command carries no
  key and no key variable. In CI, `keyVariable` names the variable the CI filled from the participant's secret; this
  module never sees or passes the value. An abort of the signal stops the agent and every process it started, before
  anything further is pushed. It throws `AgentMissing`, `AgentNotLoggedIn`, `AgentFailed { exitCode, lastOutput }` and
  `Cancelled`.
- `testAgent(agent: Agent) -> Promise<{ answered: true, version: string } | { answered: false, reason: string }>` — a
  harmless request, a one-word answer, to show that the agent answers with its login (UC-017).

## Files

It reads its own data files. The agent it starts reads and writes the working folder it is given — the checkout of a
product's branch — and nothing else of Agent M's.

## Uses

- `MOD-job-runner.Driver`, `MOD-job-runner.DriverInput`, `MOD-job-runner.Usage` — the driver type it implements, its
  input, and the usage it returns.
- `MOD-participant-list.Participant` — the participant the driver stands for.
- `MOD-documents.loadSchema`, `MOD-documents.readRegister` — the register of supported agents.
