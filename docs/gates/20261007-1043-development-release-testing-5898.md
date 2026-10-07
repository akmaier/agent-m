---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 640dd28d1aee058982303f68044faedce6f0a9dd
  - https://github.com/akmaier/agent-m/pull/157
date: 2026-10-07 10:43 UTC
---
# Development → Release testing: sprint 07, between jobs — the dashboard reaches MOD-notifications

**REGISTER**

## Reason

The change between jobs that the record of sprint 07 names, before ITM-238: pull request #157 by developer-sonnet-a, on
head `640dd28`, branched from `sprint/07` at `28cb5e0`, checked against `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS`.
- CI is green on the head (python and node).
- The three new tests, one per page that reaches the module, each have their counter-proof recorded in the commit.
- Each change makes old code call a module in place of its own code:
  - `docs/assets/dashboard-app.mjs` and `src/home/home.mjs`, the latter in no module's folder, start `watchForAcceptance`
    with MOD-browser-store's store of the instance;
  - `docs/assets/dashboard/settings-view.mjs` shows *Notifications* through the module's interface.
- The two choices it names hold. The watch starts only where the browser has `Notification`, which changes nothing in a
  browser, since no check is due without the permission. The line stands as a panel beside *This browser*, the only
  placement that changes no existing test's expected result.
- `addressOf` turns the module's routes into the dashboard's own: `#uc/<id>`, `#arc/<id>` for a decision and a module,
  `#spec/<queue>/<nn>`, and `#release`.

Noted for ITM-238 and the sprint's end, no reason by themselves:
- Both pages connect the instance with MOD-browser-store's `github-token`, which nothing in the repository writes. The
  dashboard keeps the instance's token in its own store, `store.getToken()`, with which `process-view.mjs` connects it. So
  on the dashboard the checks read the instance without its token, where UC-047 step 2 reads each repository "with the
  token of each" and MOD-notifications takes "the instance as the frame connected it".
- The line stands beside the section *This browser*, where UC-047 step 1 places it in it.
