---
id: ITM-269
title: The Bridge alternative of endpoint configuration
level: module
realises:
  - UC-003
  - CONFIGURATION LIVES IN THE BROWSER
  - A CREDENTIAL IS NEVER PLACED IN A URL
  - AN UNSUPPORTED ENDPOINT SAYS SO
  - A CLEAR IS A REAL CLEAR
  - NO SECRET IN THE REPOSITORY
  - THE PAGE STATES WHAT IT SENDS WHERE
modules:
  - MOD-settings-pages
builds_on:
  - ITM-265
  - ITM-263
  - ITM-268
tests:
  - unit
origin:
  - UC-003
---
# ITM-269 The Bridge alternative of endpoint configuration

**REGISTER**

## Outcome

Extend ITM-265's endpoints route with UC-003 alternative 2a using the accepted Bridge test operation. Use the paired Bridge settings and configured HTTPS route supplied by UC-044; disclose where the request goes before the action. Save the endpoint configuration in this browser before testing, preserve a refused key until changed or cleared, and clear its actual storage entry. Keep the direct path working.

Start only after ITM-265 has merged and its module is free, and after the accepted transport and runnable composition are present. Name the merged UC-044 setup delivery before selection. A missing setup leads to the agreed pairing/setup handoff with an actionable message, never a successful test or a direct browser fallback to the model. This item does not provision tunnels or implement the full Bridge setup.

## Acceptance

- New page tests cover Bridge success, refused key, absent pairing, unavailable Bridge and configured HTTPS transport, with the accepted settings shape mapped to its request.
- A throughBridge test contacts only that Bridge. Pairing token, endpoint key and optional jump-host login use the accepted body/header locations, never URLs, cookies or repository files.
- Save precedes the test; reload retains the setting and refused key; Clear removes it. Existing direct endpoint and add-product tests pass unchanged.
- Only src/settings-pages/ and new tests naming MOD-settings-pages change.
- The tests-only first commit has red CI; final-head CI is green; every new test has a recorded planted-fault counter-proof. Tests use constructed responses and no paid service.
