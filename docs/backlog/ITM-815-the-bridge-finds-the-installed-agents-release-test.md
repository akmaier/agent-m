---
id: ITM-815
title: The release test that the installed agents are found and run with their own login
level: system
realises:
  - UC-044
  - THE BRIDGE FINDS THE INSTALLED AGENTS
  - A LOCAL AGENT USES THE PERSON'S OWN LOGIN
modules:
  - MOD-agent-processes
builds_on:
tests:
  - release
origin:
  - akmaier's instruction of 2026-10-17 that team 2 plans around team 1
---
# ITM-815 The release test that the installed agents are found and run with their own login

**REGISTER**

## Outcome

`tests/test_bridge_agents.py`, the check SPEC.md names for `THE BRIDGE FINDS THE INSTALLED AGENTS` and `A LOCAL AGENT
USES THE PERSON'S OWN LOGIN`, does not exist. MOD-agent-processes' `installedAgents` and `agentDriver` are built
(`src/agent-processes/index.mjs`). The test is written with the cases these two decide. That only the agents chosen in
the bridge's settings are offered is decided by MOD-bridge-jobs' `GET /v1/agents` handler; its case is added to the
file by an item of that module.

## Acceptance

- With fixture executables of some supported agents on the path, exactly those are listed as installed, each with the
  version the fixture reports, and the others as missing with their installation page.
- Outside CI, with `keyVariable` `null`, the command the driver starts carries no key and its environment no key
  variable of the register.
- Each test names the requirement it guards, the module it exercises and its level `release`; its cases stand in a
  Markdown data file beside it, and the Python file only loads them (AGENTS.md §7).
- It is written by a participant who implemented none of the behaviour it tests; each test's counter-proof — a fault
  planted in the module, and the test failing on it — is recorded in the pull request.
- Only the new test file and its data file change.
