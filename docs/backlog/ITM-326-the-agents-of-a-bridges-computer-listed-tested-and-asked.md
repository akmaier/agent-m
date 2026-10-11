---
id: ITM-326
title: The agents a Bridge offers, listed, tested and asked
level: module
realises:
  - UC-011
  - UC-017
  - THE BRIDGE FINDS THE INSTALLED AGENTS
  - A LOCAL AGENT USES THE PERSON'S OWN LOGIN
modules:
  - MOD-bridge-jobs
builds_on:
  - ITM-323
  - ITM-320
  - ITM-321
tests:
  - unit
origin:
  - UC-017 steps 3 and 6
  - UC-011 step 3
---
# ITM-326 The agents a Bridge offers, listed, tested and asked

**REGISTER**

## Outcome

MOD-bridge-jobs' `jobHandlers` gains, as its file states them, for the agents the Bridge offers — those of
`installedAgents`' agents (ITM-320) that its settings name with their working folders —: `GET /v1/agents`, the offered
agents with version, ready and logged in, and the supported agents missing on this computer; `POST /v1/probes/agent`,
`testAgent`'s answer for the named agent, `invalid-request` for an agent it does not offer; and `POST /v1/ask` with `GET
/v1/ask/{ask}` for an agent — a drafting request through `agentDriver` (ITM-321), answered `running`, `done` with its
text and usage, or `failed` with its error; the correction loop stays in the page. The endpoint-test probe stays as it
is. An ask to an endpoint (ITM-408), hand-over and watching (ITM-327), the job list, log and cancel, and the probes
`endpoint-models` and `partitions` are not part of this item.

## Acceptance

- Unit tests that name MOD-bridge-jobs state, before the code exists, with MOD-agent-processes' agents replaced by
  fixture executables and two of them offered: the offered agents and those missing; an installed agent that is not
  offered left out; a probe answered, and `invalid-request` for an agent not offered; an ask running, then done with
  text and usage; a failed ask with its error; nothing of an ask kept on disk.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/bridge-jobs/` and the tests that name MOD-bridge-jobs change.
