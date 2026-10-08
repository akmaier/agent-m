---
id: ITM-266
title: The system and release tests of UC-003
level: system
realises:
  - UC-003
modules:
  - MOD-settings-pages
  - MOD-browser-store
  - MOD-endpoint-calls
  - MOD-bridge-client
  - MOD-bridge-http
  - MOD-bridge-jobs
  - MOD-desktop-shell
builds_on:
  - ITM-269
tests:
  - system
  - release
origin:
  - UC-003
---
# ITM-266 The system and release tests of UC-003

**REGISTER**

## Outcome

UC-003 checked through the dashboard's Settings entry after the endpoint wiring and runnable Bridge composition named in docs/backlog/sprints/09.md are merged. A Developer who implemented none of the exercised behaviour writes the system test of the main flow and alternatives 4a, 2a, 4b and 2b, and at least one release test per requirement UC-003 realises. For 2a, exercise the implemented Bridge client, server and handler against a controlled model server; an HTTPS forwarding fixture represents UC-044's already-configured route. Replacing the whole Bridge by a result stub is insufficient. CI/Bridge job execution and tunnel provisioning remain their own use-case handoffs.

## Acceptance

- Each test declares its unique TST identifier, input, precondition and expected result, and names its one level/module/guards and has a recorded planted-fault counter-proof.
- The six realised requirements cover browser-local persistence, no configuration cookie, no credential URL, actionable browser diagnosis, real credential removal and no repository secret.
- A reload, retained refused key and Clear are observed through the page. The local model gets the short request from the Bridge, including the HTTPS transport case.
- No commit test calls a paid service. Findings follow UC-003 and are recorded without changing expected outcomes to fit the code.
- Only new test files change; the PR identifies the independent author.
