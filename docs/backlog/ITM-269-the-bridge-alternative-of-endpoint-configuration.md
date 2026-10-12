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
  - ITM-280
  - ITM-403
  - ITM-404
  - ITM-405
tests:
  - unit
origin:
  - UC-003
---
# ITM-269 The Bridge alternative of endpoint configuration

**REGISTER**

## Outcome

Extend ITM-265's endpoints route with UC-003 alternative 2a using the accepted Bridge test operation. For an endpoint the browser cannot call, the person chooses the Bridge that reaches it among the Bridges this browser keeps (ITM-405), and the configuration `{ url, kind, model, key?, bridge }` names it; disclose where the request goes before the action. Save the endpoint configuration in this browser before testing, preserve a refused key until changed or cleared, and clear its actual storage entry. Keep the direct path working.

Start only after ITM-265 has merged and its module is free, and after the accepted transport and runnable composition are present. Name ITM-280's merged configuration route and actual dashboard entry before selection. Read the named Bridge's entry and the jump host from the store into BridgeSettings with `settingsOf` (ITM-404) — its own address, or the jump host's HTTPS address with the Bridge's path; a saved HTTPS configuration is untested until this actual endpoint test answers. A missing setup leads to the agreed pairing/setup handoff with an actionable message, never a successful test or a direct browser fallback to the model. This item does not provision tunnels or implement the full Bridge setup.

This is the endpoint route's behavioral transition to the accepted named-Bridge format, not refactoring. New saves
write `{ url, kind, model, key?, bridge? }`: `bridge` is the chosen Bridge's name and is absent for a direct endpoint.
They do not write `throughBridge` or read the single `bridge` key to select a destination. Read `bridge:<name>` and the
jump host through the existing public store, then use `settingsOf`, `bridgeAt` and `probe`; the Bridge client owns its
HTTPS path and protocol fields. Keep current direct request and diagnostic behavior and all stored keys until the
person changes or clears them. An old bridged value that names no Bridge requires an explicit named choice/setup
before testing; it neither chooses the last-paired Bridge nor falls back to the model. No automatic rewrite, additional
store catalogue, metadata cache or compatibility transport belongs to this item.

## Acceptance

- New page tests cover Bridge success, refused key, absent pairing, unavailable Bridge and configured HTTPS transport, with the accepted settings shape mapped to its request.
- An endpoint's test contacts only the Bridge its configuration names. Pairing token, endpoint key and optional jump-host login use the accepted body/header locations, never URLs, cookies or repository files.
- Save precedes the test; reload retains the setting and refused key; Clear removes it. Existing direct endpoint
  behavior and add-product expectations stay unchanged: one short provider request, its original body/headers, optional
  key handling, diagnosis and CI/Bridge alternatives, no cookie/repository/URL secret, hidden key until Show,
  instance isolation, save-before-request and actual Clear. The endpoint format expectations below are the explicit
  exception; they do not weaken those outcomes.
- Replace only the obsolete endpoint-format and destination-selection expectations in existing tests that name
  MOD-settings-pages: `throughBridge: false` becomes absence of `bridge` for a direct endpoint, and `throughBridge:
  true` becomes the selected `bridge` name. Literal `bridge` setup fixtures become `bridge:<name>` entries; HTTPS
  fixtures supply the port entry and jump host to `settingsOf`, retaining the same resulting path and distinct
  credential headers. Fixtures drive a named choice instead of a boolean checkbox. These expected-format changes
  apply to the direct raw-record assertions in TST-265001/265007/265011 and TST-292001, and Bridge cases TST-265005,
  TST-269001–005, TST-269901–904, TST-266001/002 and TST-292009; other old endpoint fixtures may change preparation
  to this same accepted format, without changing their functional expectation. Preserve existing test IDs and every
  unrelated expected result. Name each actual changed input/assertion and accepted replacement in the pull request.
  Do not change the BrowserStore catalogue, test helpers or tests that name no selected module.
- Only src/settings-pages/, new tests naming MOD-settings-pages and the explicitly scoped existing endpoint tests
  above change. The affected existing batteries are `settings-pages-endpoints.test.mjs`,
  `mod-settings-pages-bridge-endpoint.test.mjs`, `release-itm-269-endpoint-route.test.mjs`,
  `system-uc-003-direct-endpoint.test.mjs`, `release-uc-003-direct-endpoint.test.mjs`,
  `system-uc-003-dashboard-bridge.test.mjs` and `release-uc-003-dashboard-https-bridge.test.mjs` under `tests/`.
  Existing add-product tests remain unchanged. No test is removed or converted to a todo to conceal a failure.
- The tests-only first commit has red CI; final-head CI is green; every new test has a recorded planted-fault counter-proof. Tests use constructed responses and no paid service.
