---
id: ITM-326
title: The agents of a Bridge's computer, listed, tested and asked
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
# ITM-326 The agents of a Bridge's computer, listed, tested and asked

**REGISTER**

## Outcome

MOD-bridge-jobs' `jobHandlers` gains, as its file states them: `GET /v1/agents` — `installedAgents`' agents with
version, ready and logged in, and those missing (ITM-320) —; `POST /v1/probes/agent` — `testAgent`'s answer for the
named agent, `invalid-request` for an agent this computer lacks —; and `POST /v1/ask` with `GET /v1/ask/{ask}` — a
drafting request to one agent through `agentDriver` (ITM-321), answered `running`, `done` with its text and usage, or
`failed` with its error; the correction loop stays in the page. The endpoint-test probe stays as it is. Hand-over and
watching (ITM-327), the job list, log and cancel, and the probes `endpoint-models` and `partitions` are not part of this
item.

## Acceptance

- Unit tests that name MOD-bridge-jobs state, before the code exists, with MOD-agent-processes' agents replaced by
  fixture executables: the agents and those missing as `installedAgents` gives them; a probe answered, and
  `invalid-request` for a missing agent; an ask running, then done with text and usage; a failed ask with its error;
  nothing of an ask kept on disk.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/bridge-jobs/` and the tests that name MOD-bridge-jobs change.
