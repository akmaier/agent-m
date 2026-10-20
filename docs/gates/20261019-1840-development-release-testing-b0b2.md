---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 6c2d4f8e004d2c22e6e969edb19b0ab1c5b17b86
  - https://github.com/akmaier/agent-m/pull/1125
date: 2026-10-19 18:40 UTC
---
# Development → Release testing: ITM-1099, the routes of the maintenance pages are reached from the live dashboard's menu

**REGISTER**

## Reason

ITM-1099, pull request #1125 into `sprint/team2/97`, passes on `6c2d4f8e`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `54031f40` holds only tests, and CI failed on it.
2. **The change.** The live app builds MOD-maintenance-pages' view, and its menu opens `#mail`. h's test
   `site-frame-maintenance-menu` pins the dispatch.
3. **Changed tests.**
   - h's fix commit `1a034759` failed CI on three unit and look tests that pinned the old menu: `dashboard-shell`,
     `dashboard-pending-release-report` and `site-usability.d/routes`. `415d9cce` updates them. None is a release test.
   - The release test `tests/release-sprint-02-a-dashboard-app.test.mjs` (:536, :545, :547-548) is changed by
     developer-sonnet-f, not the implementer, in its own commit `6c2d4f8e`. It names the route `mail`, and it passed in the
     coordinator's merge test.
4. **Scope.** MOD-site-frame's files and tests.
