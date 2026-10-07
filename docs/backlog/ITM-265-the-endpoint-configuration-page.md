---
id: ITM-265
title: The endpoint configuration page
level: module
realises:
  - UC-003
  - CONFIGURATION LIVES IN THE BROWSER
  - CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE
  - A CREDENTIAL IS NEVER PLACED IN A URL
  - AN UNSUPPORTED ENDPOINT SAYS SO
  - A CLEAR IS A REAL CLEAR
  - NO SECRET IN THE REPOSITORY
  - EVERY SETTING IS REACHED FROM ONE PAGE
  - EVERY STEP EXPLAINS ITSELF
  - THE PAGE STATES WHAT IT SENDS WHERE
modules:
  - MOD-settings-pages
builds_on:
  - ITM-207
  - ITM-259
  - ITM-260
  - ITM-264
  - ITM-272
tests:
  - unit
origin:
  - UC-003
---
# ITM-265 The endpoint configuration page

**REGISTER**

## Outcome

Add MOD-settings-pages' endpoints route to ITM-207's existing view interface. Enter URL, kind, model and optional key; show the destination disclosure before the action; save in MOD-browser-store before sending one short test; show success or diagnosis; keep a refused key until changed or cleared; load it after reload and remove the entry on Clear. Expose the endpoint setting from Settings with Test, Change and Clear. This item implements the direct endpoint path. ITM-269 adds the Bridge alternative to the same route after this item merges; until then, a local model is shown as requiring that setup, never as tested successfully. Map the stored `{url, kind, model, key?, throughBridge}` configuration to the accepted endpoint-calls configuration `{name, kind, baseUrl, model, key}` at the page boundary, with an absent key mapped to null.

Wait until ITM-207 and every builds_on item are merged into the target branch. Dashboard entry/routing wiring is the separately named change between jobs in docs/backlog/sprints/09.md. A missing Bridge setup is shown as a specific setup requirement, never as a working model test.

## Acceptance

- New unit tests through view with store/transports replaced by fakes walk the main flow, browser refusal (4a), refused key (4b) and real clear (2b).
- The save occurs before the test. Reload recovers the configuration; Clear removes storage as well as the form; a provider's refused-key message is visible and the key stays stored.
- A stored throughBridge configuration is never sent directly to its model from the browser. The page names the missing Bridge setup and preserves its setting for ITM-269. Tests cover the storage-to-driver mapping, including an absent key.
- Secrets remain hidden under the existing accepted settings controls; no cookie, URL or repository receives a credential. All affected add-product tests remain green unchanged.
- Only src/settings-pages/ and new tests naming MOD-settings-pages change.
- The tests-only first commit has red CI; final-head CI is green; every new test has a recorded planted-fault counter-proof. Tests use constructed responses and no paid service.
