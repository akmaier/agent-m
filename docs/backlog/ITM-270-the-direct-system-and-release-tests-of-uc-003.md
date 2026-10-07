---
id: ITM-270
title: The direct system and release tests of UC-003
level: system
realises:
  - UC-003
modules:
  - MOD-settings-pages
  - MOD-browser-store
  - MOD-endpoint-calls
builds_on:
  - ITM-265
tests:
  - system
  - release
origin:
  - UC-003
---
# ITM-270 The direct system and release tests of UC-003

**REGISTER**

## Outcome

UC-003's direct endpoint increment checked through the dashboard's Settings entry after ITM-265 and the endpoint
wiring named in docs/backlog/sprints/09.md are merged. A Developer who implemented none of the exercised behaviour
writes a system test of the main flow and direct alternatives 4a, 4b and 2b, and at least one release test per requirement
UC-003 realises. Use controlled OpenAI-compatible and Anthropic endpoint responses through the actual page and driver,
with browser blocking represented where the browser obscures its cause. This item does not claim the unimplemented
Bridge alternative 2a or replace ITM-266's complete composed-Bridge tests or ITM-267's measurement.

## Acceptance

- Every test declares its unique TST identifier, one level, guarded requirements/use case and exercised module/system,
  precondition, input and expected result; every new test has a recorded planted-fault counter-proof.
- The main flow saves before sending one short request and shows success. Browser refusal gives an actionable diagnosis
  and CI/Bridge alternatives; a refused key displays the provider message and stays stored until changed or cleared.
- Independent release tests cover all six UC-003 requirements: browser-local configuration, no configuration cookie,
  no credential URL, actionable browser diagnosis, real stored-credential removal and no repository secret.
- Exercise reload, two instances' isolation, optional key, destination disclosure and hidden/revealed key controls through
  the actual dashboard route. A throughBridge configuration is retained with its setup requirement and sends no direct
  model request; no Bridge success is invented.
- Only new test files change; the PR names the independent author and the integrated revision. No paid service is called.
  Findings follow UC-003 and never change expected results to fit the code.
