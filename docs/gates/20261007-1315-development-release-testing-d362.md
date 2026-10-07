---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 50dc86c1ae510b0a2c4fc9732a01528bab837e57
  - https://github.com/akmaier/agent-m/pull/163
date: 2026-10-07 13:15 UTC
---
# Development → Release testing: sprint 08, between jobs — ITM-238's F1 and F2

**REGISTER**

## Reason

The change between jobs that the record of sprint 08 names before ITM-243: pull request #163 by developer-sonnet-a, on
head `50dc86c`, branched from `sprint/08` at `f3ca09c`, checked against `WHAT NO MODULE OWNS IS CHANGED BETWEEN JOBS`.
- CI is green on the head (python and node).
- Only files no module owns changed — `docs/assets/dashboard/settings-view.mjs`, `docs/assets/dashboard-app.mjs`,
  `src/home/home.mjs` — and the test file of the dashboard's wiring to MOD-notifications; no module's folder changed.
- Each change makes the old code call MOD-notifications as the module states it:
  - F2: the main and review pages hand `watchForAcceptance` the instance as the dashboard connects it, with the token it
    keeps for it (`ghToken()`, `store.getToken()`), as `process-view.mjs` connects it. Before, they used
    MOD-browser-store's `github-token`, which nothing writes.
  - F1: the settings page places the module's line in the section *This browser* (UC-047 step 1), beside
    `#browser-settings`, whose closed list of rows two existing tests pin.
- The three new tests in `tests/dashboard-notifications-wiring.test.mjs`, which names MOD-notifications and guards
  UC-047, show F1 fixed and F2 fixed at both of its call sites. Each has its counter-proof recorded in the pull request,
  and the file's existing tests are unchanged.
- ITM-238's todo marks stay for ITM-243.
