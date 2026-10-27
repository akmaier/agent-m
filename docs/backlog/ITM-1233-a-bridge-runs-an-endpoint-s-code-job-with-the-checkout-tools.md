---
id: ITM-1233
title: A Bridge runs an endpoint's code job with the checkout's tools
level: module
realises:
  - RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
  - UC-049
modules:
  - MOD-desktop-shell
  - MOD-bridge-jobs
  - MOD-bridge-client
builds_on: []
tests:
  - unit
origin:
  - the check of the documents akmaier accepted since 2026-10-25 against the code: MOD-checkout-tools and ARC-046 register the checkout's tools in CI or on a Bridge; the Bridge does not, and its endpoint path drops the continuation of a cut answer
---
# ITM-1233 A Bridge runs an endpoint's code job with the checkout's tools

**REGISTER**

## Outcome

MOD-checkout-tools (:21-26, :72) and ARC-046 (:140-145) register the checkout's tools in CI or on a Bridge. CI does
(`src/workflow-entries/compose.mjs:233`); the Bridge does not: `src/desktop-shell/compose.mjs:16` `STRATEGIES` holds
none of them, and `src/bridge-jobs` runs no endpoint job in a checkout. And MOD-endpoint-calls' continuation of an answer
cut at the output limit does not reach a bridged endpoint: `src/bridge-jobs/handlers.mjs:84` keeps only `{ text,
calls, usage }`, `src/bridge-client/index.mjs:154` returns no `cut`. Implement both as the module texts state.

## Acceptance

- Tests naming these modules: a code kind's job for a model endpoint on a Bridge is offered the checkout's tools and
  edits the checkout; a bridged answer cut at the output limit is continued as on the tab and in CI. Counter-proof:
  before the change neither holds.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only the modules named and the tests that name them change; preloads, where needed, in a commit of their own.
