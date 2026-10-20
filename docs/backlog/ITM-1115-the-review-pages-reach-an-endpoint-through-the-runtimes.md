---
id: ITM-1115
title: The review pages reach an endpoint only through what their text names
level: module
realises:
  - DEVELOP AGAINST INTERFACES
modules:
  - MOD-review-pages
  - MOD-runtimes
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
- Only `src/review-pages/`, `src/runtimes/` and the tests that name their modules change.

**Stopped at its first task (sprint team1/97, developer-sonnet-a): `runOnTab` does not serve the need.**
- `jobs.mjs:596` → `checkDraft` (`:691-701`) builds drivers with `endpointDriver` and calls `runJob` with `from`, the
  person's edited draft (MOD-job-runner.md:271-273).
- `runOnTab` passes no `from` (`src/runtimes/tab.mjs:137`, `:170`; MOD-runtimes.md:186-192).
- `runJob` (`jobs.mjs:18`) is not named in MOD-review-pages' uses either.
- **The way chosen (po-opus):** `runOnTab` gains a hook `from`, which it hands to `runJob`. *Check this edit* on the
  draft then runs through `runOnTab` with no record, and the page imports neither `endpointDriver` nor `runJob`.
  - *Nothing twice:* one way builds a tab job's drivers.
  - *One responsibility:* MOD-runtimes runs the tab's jobs.
- Naming the two imports in MOD-review-pages' uses instead would keep a second way to the same drivers.
- The draft of MOD-runtimes.md, by developer-sonnet-a, goes to `main` for akmaier. The item waits for its acceptance.

