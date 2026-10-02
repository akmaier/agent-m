---
id: ITM-105
title: The CLI and sandboxed-agent driver from the browser, and local model servers through the bridge
kind: implementation
level: 2
realises:
  - UC-011
  - UC-003
  - UC-017
modules:
  - MOD-participants
depends_on:
  - ITM-099
  - ITM-101
origin: backlog refinement 2026-10-01
---
# ITM-105 The CLI and sandboxed-agent driver from the browser, and local model servers through the bridge

**REGISTER**

## Outcome

`cliDriver(participant, route)` forwards `send`, `start`, `state`, `log` and `cancel` to the bridge that hosts the agent, on loopback or over the HTTPS route; `endpointDriver` gains the *bridge* route to a local model server (UC-003 2a).

## Realises

- UC-011 — Hand a job to a local CLI session
- UC-003 — Configure a model endpoint
- UC-017 — Configure the participants of the instance

## Where it came from

Backlog refinement of 2026-10-01 (SOFTWARE_MAINTENANCE.md Phase 2) from the accepted architecture — MOD-participants `cliDriver`; ARC-009 decisions 2, 4.

Architecture decisions its modules follow: ARC-003, ARC-009, ARC-011, ARC-012.

## Modules

- MOD-participants (adapters) — uses MOD-bridge-server

The pull request changes only code files and tests that name one of these modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).

Files it creates or changes:

- `docs/assets/participants/cli-driver.mjs` (new)
- `tests/participants.cli-driver.test.mjs` (new)

## Kind and level

- Job kind: **implementation** — its first commit holds only tests and CI is red on it (`AN IMPLEMENTATION JOB BEGINS WITH A FAILING TEST`).
- Level: **2** — needs the Agent M Bridge on a person's computer.

## Tests the SPEC names

- none — it realises use cases only; its tests are the files listed above.

## Acceptance criteria


From the postcondition of UC-011 (Hand a job to a local CLI session), for the part this item builds:

> - The artifacts arrived as open; nothing counts as accepted before a person accepts it.
> - The bridge never listened on a non-loopback interface.

From the postcondition of UC-003 (Configure a model endpoint), for the part this item builds:

> - The configuration exists only in this browser.
> - The key has not appeared in a URL, a cookie, or any repository.

From the postcondition of UC-017 (Configure the participants of the instance), for the part this item builds:

> - The instance lists the participant with type, capabilities and processing place; no key is in the
>   repository.
> - Products can assign it to roles that need no more than its capabilities (UC-002).

Further:

- Every new code file and test names its module, and every test names what it guards and its level (ARC-020).
- Every new test is shown red on a planted fault, recorded with the change (`A NEW TEST IS SHOWN TO FAIL ON A PLANTED FAULT`).
- CI is green on the pull request and the default Definition of Done holds (`THE DEFAULT DEFINITION OF DONE IS THE JOB RULES`).

## Depends on

- ITM-099 — the bridge client
- ITM-101 — the bridge routes it calls

## Needs a person

No.
