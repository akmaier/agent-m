---
id: ITM-1115
title: The review pages reach an endpoint only through what their text names
level: module
realises:
  - DEVELOP AGAINST INTERFACES
modules:
  - MOD-review-pages
builds_on:
tests:
  - unit
origin:
  - developer-sonnet-g's probe for ITM-1068 (sprint team2/97), on main at b1e4e7f4
---
# ITM-1115 The review pages reach an endpoint only through what their text names

**REGISTER**

## Outcome

`src/review-pages/jobs.mjs:15` imports `endpointDriver` of MOD-endpoint-calls, which MOD-review-pages' `uses:` does not name.
A job that runs in the tab builds its drivers in MOD-runtimes' `runOnTab` (MOD-runtimes.md, `runOnTab`: "an endpoint's driver
from its configuration, `endpointDriver` where its `bridge` is `null`"), which the review pages use. So a driver built in the
page is a second way to the same driver.

**First task:** read what `jobs.mjs` builds the driver for. Where `runOnTab` gives it, the page's import goes (a code fix).
Where it does not, the item stops for a draft naming the use.

## Acceptance

- The review pages build no endpoint driver of their own: a test shows the page's tab job running through `runOnTab`, with a
  counter-proof. Or, if the reading finds a need `runOnTab` does not serve, the draft is on `main` and the item waits.
- Only `src/review-pages/` and its tests change.
