---
id: ITM-259
title: Endpoint settings in the browser store
level: module
realises:
  - UC-003
  - CONFIGURATION LIVES IN THE BROWSER
  - CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE
  - A CLEAR IS A REAL CLEAR
modules:
  - MOD-browser-store
builds_on:
  - ITM-204
tests:
  - unit
origin:
  - UC-003
---
# ITM-259 Endpoint settings in the browser store

**REGISTER**

## Outcome

Extend MOD-browser-store's existing catalogue with `endpoint:<name>` and the Bridge connection and last-test keys this slice needs, using their accepted formats. Its existing readSetting, writeSetting and clearSetting store, load and remove the URL, kind, model, optional key and throughBridge choice under the instance prefix. This item adds no export/import feature, other settings family or repository storage.

## Acceptance

- New unit tests cover save/read after reopening the same store, an endpoint without a key, overwriting a refused key only on an explicit change, and removal of the actual stored entry on Clear.
- Two instance prefixes do not share endpoint or pairing settings. Existing product, repository-token and notification tests remain green unchanged.
- Only src/browser-store/ and new tests naming MOD-browser-store change.
- The tests-only first commit has red CI; final-head CI is green; every new test has a recorded planted-fault counter-proof. Tests use constructed responses and no paid service.
