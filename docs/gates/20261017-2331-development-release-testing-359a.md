---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 2feb3c95ad471766256aa577d3d3fdd1ef155997
  - https://github.com/akmaier/agent-m/pull/815
date: 2026-10-17 23:31 UTC
---
# Development → Release testing: ITM-853, the settings page follows a product token's clear and any stored token

**REGISTER**

## Reason

ITM-853, pull request #815 into `sprint/team1/80`, at head `2feb3c95`. It is mergeable, and run 39079131383 passed twelve of
twelve. It changes `src/settings-pages/settings.mjs` (+5/−2) and adds a test file.

**Red, then code.** The tests-only commit `74feb36e` was red in run 39078873674 on exactly TST-853001 to 003, six cases with
and without the instance's token. The code was pushed after the run had ended.

**The acceptance is met.**
- ITM-825's `reconnectHosts` also runs after a product's *Remove*, after *Clear* on the list of products, and after a
  token's *Save*. It uses only `connect`, `parseAddress` and the module's `credentialsFor`.
- On the fixture of the live app with a product that has its own token:
  - after a product is removed or cleared, none of the six requests carries the cleared product token;
  - after *Save*, the *Repositories* tab's three requests carry the new token.
- No request is added.
- Leaving out each of the three calls fails exactly its two cases.
- The 75 files of MOD-settings-pages give the same names and statuses on the base and the head. The planted-fault
  harnesses in `settings.mjs` agree, no release test changed, and ITM-018 passes.

**Readings accepted.**
- "Clear" is the *Clear* on the list of products' line, since the token line's own *Clear* was ITM-825's.
- "After a token is stored" is the *Save* on a token's line, the one place in `settings.mjs` that stores one.

**The refusal.** `xargs node --test < list` was refused. The plain `node --test` with the 75 names written out is a plain
command the guard can check, which `79.md`'s ruling allows.

**Findings.**
- The add-product page and *Finish setting up* store tokens without reconnecting. This is ITM-860, registered, test first.
- TST-853003 pins only the instance's host, since the product host's read cannot be seen from the page. ITM-860 makes it
  observable.
