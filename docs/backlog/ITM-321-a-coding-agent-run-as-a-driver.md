---
id: ITM-321
title: A coding agent run as a driver
level: module
realises:
  - UC-010
  - UC-011
  - A LOCAL AGENT USES THE PERSON'S OWN LOGIN
  - A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
  - A CANCELLED JOB WRITES NOTHING MORE
  - ONE DEFINITION, THREE DRIVERS
modules:
  - MOD-agent-processes
builds_on:
  - ITM-320
tests:
  - unit
origin:
  - UC-011 step 3
  - UC-010 step 3
---
# ITM-321 A coding agent run as a driver

**REGISTER**

## Outcome

MOD-agent-processes' `agentDriver` and its part `processes.mjs`, as its file states them: a driver whose `send` starts
the agent with the input as its task in the working folder, in the form the register's task column gives, streams its
output through `onOutput`, and returns its final answer and the usage it reported, or `null`. Outside CI its command
carries no key and no key variable; in CI only the variable that the CI filled from the participant's secret is named,
never its value. An abort stops the agent and every process it started before anything further is pushed. It throws
`AgentMissing`, `AgentNotLoggedIn`, `AgentFailed { exitCode, lastOutput }` and `Cancelled`. Its callers — the Bridge's
asks and jobs (ITM-326, ITM-327) and the job workflow's entries (ITM-365) — are not part of this item.

## Acceptance

- Unit tests that name MOD-agent-processes state, before the code exists, with fixture agent executables: an answer
  and its usage returned and the output streamed; outside CI no key in the command or its environment, in CI only the
  variable's name; an abort stopping the fixture and its child before the child writes the marker file it writes
  later; each of the four errors by name.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/agent-processes/` and the tests that name MOD-agent-processes change.
