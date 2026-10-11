---
id: ITM-320
title: The coding agents a computer has, and their test
level: module
realises:
  - UC-011
  - UC-017
  - THE BRIDGE FINDS THE INSTALLED AGENTS
  - A LOCAL AGENT USES THE PERSON'S OWN LOGIN
  - THE BRIDGE GUIDES THE INSTALLATION OF A MISSING AGENT
modules:
  - MOD-agent-processes
builds_on:
tests:
  - unit
origin:
  - UC-017 steps 3 and 6
  - UC-011 step 3
---
# ITM-320 The coding agents a computer has, and their test

**REGISTER**

## Outcome

The module's folder `src/agent-processes/` with `Agent`, `installedAgents` and `testAgent`, as MOD-agent-processes' file
states them, and its data: `agents.md`, the register of the supported agents — `claude`, `codex`, `opencode`, each with
its command, version query, task form, login check, key variable and installation pages, read from the vendors'
documentation when it is built —, and `agents.schema.md` in MOD-documents' schema language. `installedAgents` finds each
agent on the machine's path with its version and whether it is logged in, starting only the register's version and
login-check commands; a missing one comes with its installation page; it never asks for a password. `testAgent` asks for
a one-word answer. `agentDriver` (ITM-321) is not part of this item.

## Acceptance

- Unit tests that name MOD-agent-processes state, before the code exists, with fixture executables on a temporary path
  and no network: two installed agents listed with their versions and one missing with its installation page; an agent
  not logged in marked so, with its own login step named; `testAgent` answering, and failing with its reason; a
  register that breaks its schema stopping the module's load.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/agent-processes/` and the tests that name MOD-agent-processes change.
