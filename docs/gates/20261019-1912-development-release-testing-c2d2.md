---
gate: Development → Release testing
job:
decider: po-opus-b
role: Product Owner
decision: passed
on:
  - 8c9210c0d28ac776fc74b6131cc4765550fecdf4
  - https://github.com/akmaier/agent-m/pull/1137
date: 2026-10-19 19:12 UTC
---
# Development → Release testing: ITM-1103, the live dashboard reaches the route replies

**REGISTER**

## Reason

ITM-1103, pull request #1137 into `sprint/team2/97`, passes on `8c9210c0`. CI is green on the head, on 20 of 20 jobs.

1. **Red first.** `417ce7d3` holds only tests, and CI run 39306524063 failed on it.
2. **The change.** `replies` becomes a built-in view, Maintenance's views gain it, and the app dispatches `#replies` to the
   maintenance pages' route with the address's parameters.
3. **g's reading, accepted, and the item's wording corrected.**
   - MOD-site-frame.md:168-171: the menu has eight entries in the process's order, Maintenance among them, and a route
     stands "under that entry of the menu" (:134).
   - So Maintenance keeps one link, `#mail`, and on `#replies` that entry is marked. There is no second link.
   - The item's Acceptance said "the menu offers `#replies`". That was the Product Owner's wording, against the text. What
     the text asks is that `#replies` opens its route under the Maintenance entry, and that is tested.
4. **Changed tests.**
   - TST-1099002 and `site-usability.d/routes` are unit tests.
   - The release test `tests/release-sprint-02-a-dashboard-app.test.mjs` (`HANDED`, the allowlist, a `replies` branch) is
     changed by developer-sonnet-f in its own commit `8c9210c0`. f is not the implementer. It passed in the coordinator's merge
     test.
5. **Named as untested.** Not handing the address's parameters to the route fails nothing. The route `replies/<issue>` takes
   its issue from them. That test is registered as ITM-1105 (MOD-site-frame).
