---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 711fa7e2c1425d52432b9cb999788bdd9eb9a1c5
  - https://github.com/akmaier/agent-m/pull/826
date: 2026-10-18 00:52 UTC
---
# Development → Release testing: ITM-866, the jobs route keeps no copy of the frame's token key

**REGISTER**

## Reason

ITM-866, pull request #826 into `sprint/team1/82`, at head `711fa7e2`. Run 39084146589 passed all twelve jobs. It changes
`src/main-page/jobs.mjs` and `tests/main-page-jobs.test.mjs`, +92/−26.

**Red, then code.** The tests-only commit `cf9ec61c` was red in run 39083956581 on exactly the three new cases:
- TST-866001, the product's host refuses a stored secret;
- TST-866002, the instance is read through the frame's host;
- TST-866003, `src/main-page/` holds no rule for a token's key.

**No refactoring after all.** The item was declared a refactoring, but TST-866001 is red on the base. The route's own
connection did not carry the stored secrets. So the change also restores `NO SECRET IN THE REPOSITORY` on this route, and
red-first is the right form. The developer named this in the pull request.

**The acceptance is met.**
- The route `jobs` takes the instance's host from its context, and each product's host from `chosenProduct`. That host
  carries `secrets: secretValues(store)` and every other option of the frame's connection (sprint 81's agreement).
- `tokenKeyOf` and the route's own connection are gone.
- The seven existing assertions are unchanged.
- Three planted faults are caught: the old connection, a host without the secrets, and the instance connected from the
  store's token.

**Finding 1 stands as no item.** `home.mjs:34` reads `readSetting(store, "github-token")` for Agent M's own card.
`github-token` is a key of MOD-browser-store's catalogue (`MOD-browser-store.md:66`), not a rule built from an address, so
nothing is copied. The test's added Guards names pass ITM-018.
