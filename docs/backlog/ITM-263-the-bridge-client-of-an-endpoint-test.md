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

After ITM-261 merges, implement the accepted `probe(bridge, "endpoint-test", args)` overload using bridgeApi's endpoint-test configuration and answer types. It sends `POST /v1/probes/endpoint-test` with `{ args }`, unwraps `{ answer }`, and preserves provider diagnoses separately from the applicable named `BridgeError` failures. The client uses only the independent Bridge protocol, not the endpoint driver.

## Acceptance

- New unit tests with fetch replaced by a fake cover pairing, direct and HTTPS Bridge addresses, body fields and header credentials, success/diagnosis and each applicable accepted error.
- No request goes from the browser directly to the local model when throughBridge is selected; no token or login enters an address or a log.
- The implementation PR changes only src/bridge-client/ and new tests naming MOD-bridge-client. The separate whole-check PR below changes no owned module source or tests.
- The tests-only first commit has red CI; final-head CI is green; every new test has a recorded planted-fault counter-proof. Tests use constructed responses and no paid service.

## Whole-repository check integration

Before the implementation gate, developer-terra-b makes a separate between-jobs PR into sprint/15 changing only
`tests/test_no_backend.py`. Under SPEC's WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS, let the whole-repository check
recognise MOD-bridge-client's accepted Bridge transport and describe that channel accurately. Allow at most one fetch
across `src/bridge-client/`, without requiring the module to exist or fetch when absent. Require semantic evidence that
the requested address derives from the Bridge handle and accepted protocol path, with credentials in headers and
endpoint arguments only in the body. Do not permit an args-derived destination, an arbitrary foreign fetch, an
indirect transport bypass or additional fetch sites.

Keep the checker’s existing foreign-address/channel refusals and counter-proofs. Add bounded checker counter-proofs
for the real accepted client, wrong destination/evidence and excess count. When the module is absent on the separate
PR base, exercise its actual source at the implementation head as an independent diagnostic; do not copy it into the
checker PR. After that independently approved green PR merges, integrate the sprint base ordinarily into the owned
implementation branch, keeping its relative diff confined to its module and module-named tests. Original implementation
limit3, tests-first history, per-case evidence and independent source/release decisions remain unchanged.
