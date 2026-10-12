---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: rejected
on:
  - 30ed68a65a7e1e7f570a3dc41cf4d1e0a385e1d7
  - https://github.com/akmaier/agent-m/pull/465
date: 2026-10-12 22:05 UTC
---
# Development → Release testing: ITM-466, Microsoft's sign-in at the institution's own tenant

**REGISTER**

## Reason

ITM-466, pull request #465 by developer-sonnet-d into `sprint/team1/24`, head `30ed68a`. The condition that does not
hold: `graph-route.mjs` still uses the authority `https://login.microsoftonline.com/common`, which ITM-466's Outcome
replaces — "in place of the authority `https://login.microsoftonline.com/common` that `graph-route.mjs` uses today" —:
the silent path `cachedToken` builds its client with no address and so at `/common`, though the connection names the
account it renews; and a sign-in without an address, or with no domain, goes to `/common` too. MOD-mail-routes' file,
accepted in 50591c1e, has Microsoft's sign-in "at the institution's own tenant", which the account's domain names.
The rework takes the tenant from the address or the connection's account on both paths; where neither gives a domain,
it does not sign in at `/common`, and names how it refuses.

The rest was read too and stands for the rework: the tests-only commits `cf6abcd` and `e617624` were red (runs
38313744728, 38313832995), the code is green (run 38314064582), 8 faults are killed, and the NO SERVER check passes
unchanged. A second `SIGN_IN_SERVICE` constant in `graph-route.mjs`, beside the one in `index.mjs` that the check pins,
is the same address twice, noted for the rework to share one.
