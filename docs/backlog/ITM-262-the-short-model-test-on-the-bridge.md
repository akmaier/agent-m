---
id: ITM-262
title: The short model test on the Bridge
level: module
realises:
  - UC-003
  - AN UNSUPPORTED ENDPOINT SAYS SO
  - NO SECRET IN THE REPOSITORY
  - CONFIGURATION LIVES IN THE BROWSER
modules:
  - MOD-bridge-jobs
builds_on:
  - ITM-260
  - ITM-261
tests:
  - unit
origin:
  - UC-003
---
# ITM-262 The short model test on the Bridge

**REGISTER**

## Outcome

Build only the endpoint-test handler of jobHandlers under the accepted UC-003 refinement: call the configured model on the Bridge computer, send one short request, and return success or the diagnosis with the provider's message preserved. It retains neither configuration nor credentials after the request, and never writes them to a clone, record or log. Implement no CLI agent, work-folder, watcher, job queue, mail or cluster function.

Precondition: the handler and its use of MOD-endpoint-calls are accepted. The approved protocol from ITM-261 determines the route and format. A models-list probe cannot replace this handler.

## Acceptance

- New unit tests with the endpoint call replaced by a fake show the chosen URL/model/key reaching only the Node-side endpoint test and its result returning unchanged.
- Success, refused key, unknown model, unavailable model server and provider failure are covered; no retry or endpoint-settings persistence occurs.
- Only src/bridge-jobs/ and new tests naming MOD-bridge-jobs change. Runnable composition belongs to MOD-desktop-shell and is the separate prerequisite ITM-268.
- The tests-only first commit has red CI; final-head CI is green; every new test has a recorded planted-fault counter-proof. Tests use constructed responses and no paid service.
