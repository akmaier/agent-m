---
id: ITM-264
title: The explanations of configuring an endpoint
level: module
realises:
  - UC-003
  - EVERY STEP EXPLAINS ITSELF
  - THE PAGE STATES WHAT IT SENDS WHERE
modules:
  - MOD-site-frame
builds_on:
  - ITM-255
tests:
  - unit
origin:
  - UC-003
---
# ITM-264 The explanations of configuring an endpoint

**REGISTER**

## Outcome

Extend MOD-site-frame's explanations.md with only the topics UC-003's URL, kind, model, optional key, direct/Bridge choice, test and Clear steps need. Explain browser-local storage, the short request's destination and credentials, browser-blocked alternatives, the retained refused key, and real Clear. The local route explains the pairing/HTTPS handoff to UC-044 without claiming the model needs browser CORS permission.

## Acceptance

- New unit tests name each topic and show explain returning its expandable content and the right destination disclosure.
- ITM-255 and this item's topics remain available together; no simultaneous MOD-site-frame work is allowed.
- Only src/site-frame/ and new tests naming MOD-site-frame change.
- The tests-only first commit has red CI; final-head CI is green; every new test has a recorded planted-fault counter-proof. Tests use constructed responses and no paid service.
