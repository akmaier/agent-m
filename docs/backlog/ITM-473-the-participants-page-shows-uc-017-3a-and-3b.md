---
id: ITM-473
title: The participants page shows UC-017 alternatives 3a and 3b
level: module
realises:
  - UC-017
  - EVERY STEP EXPLAINS ITSELF
  - NO SECRET IN THE REPOSITORY
modules:
  - MOD-settings-pages
builds_on:
  - ITM-349
  - ITM-352
tests:
  - system
origin:
  - UC-017 3a
  - UC-017 3b
  - ITM-375 TST-375003
---
# ITM-473 The participants page shows UC-017 alternatives 3a and 3b

**REGISTER**

## Outcome

On the participants page, when no endpoint is configured, the inline model-endpoint form includes UC-003's one short
endpoint test request on the same page, stores the endpoint only in the browser before that request, records its test
result there, and commits no key to the repository. The CI-agent form shows the existing explanation of the SSH alternative
without a self-hosted runner, including the SSH key as an Actions secret, internet reachability, and the runner
recommendation.

## Acceptance

- The red system test `TST-375003` from ITM-375 passes without changing its expected result.
- Existing participants and endpoint tests stay green.
- Only `src/settings-pages/` changes.

