---
id: ITM-263
title: The Bridge client of an endpoint test
level: module
realises:
  - UC-003
  - A CREDENTIAL IS NEVER PLACED IN A URL
  - A REMOTE INTERFACE NAMES HOW IT FAILS
modules:
  - MOD-bridge-client
builds_on:
  - ITM-261
tests:
  - unit
origin:
  - UC-003
---
# ITM-263 The Bridge client of an endpoint test

**REGISTER**

## Outcome

Build bridgeAt, pair and the accepted endpoint-test client operation needed by UC-003. It reads the common bridgeApi protocol, sends the configuration only in the JSON body, uses the pairing token and optional HTTPS jump-host login in headers, and returns the test result or named Bridge error. No settings are stored here. Implement neither askAgent nor remote-session provisioning or the job dashboard.

Precondition: akmaier has accepted this client operation and its failure contract; finalise its name in this item before selection.

## Acceptance

- New unit tests with fetch replaced by a fake cover pairing, direct and HTTPS Bridge addresses, body fields and header credentials, success/diagnosis and each applicable accepted error.
- No request goes from the browser directly to the local model when throughBridge is selected; no token or login enters an address or a log.
- Only src/bridge-client/ and new tests naming MOD-bridge-client change.
- The tests-only first commit has red CI; final-head CI is green; every new test has a recorded planted-fault counter-proof. Tests use constructed responses and no paid service.
