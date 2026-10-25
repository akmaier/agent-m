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
  - ITM-405
  - ITM-408
tests:
  - system
  - release
origin:
  - UC-003
---
# ITM-266 The system and release tests of UC-003

**REGISTER**

## Outcome

UC-003 checked through the dashboard's Settings entry after the endpoint wiring and runnable Bridge composition named in docs/backlog/sprints/team2/09.md are merged. A Developer who implemented none of the exercised behaviour writes the system test of the main flow and alternatives 4a, 2a, 4b and 2b, and at least one release test per requirement UC-003 realises. For 2a, an endpoint whose configuration names a Bridge chosen among this browser's Bridges is tested through that Bridge — the implemented Bridge client, server and handler against a controlled model server —, and a job's request to it goes through the same Bridge; an HTTPS forwarding fixture represents UC-044's already-configured route to a Bridge reached through the jump host. Replacing the whole Bridge by a result stub is insufficient. CI/Bridge job execution and tunnel provisioning remain their own use-case handoffs.

## Acceptance

- Each test declares its unique TST identifier, input, precondition and expected result, and names its one level/module/guards and has a recorded planted-fault counter-proof.
- The six realised requirements cover browser-local persistence, no configuration cookie, no credential URL, actionable browser diagnosis, real credential removal and no repository secret.
- A reload, retained refused key and Clear are observed through the page. The local model gets the short request and a job's request from the Bridge the endpoint names, including the HTTPS transport case.
- No commit test calls a paid service. Findings follow UC-003 and are recorded without changing expected outcomes to fit the code.
- Only new test files change; the PR identifies the independent author.
