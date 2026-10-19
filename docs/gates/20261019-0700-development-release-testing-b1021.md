---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 8b7744a53860e3f00f5fbbd901b0efff504792a6
  - https://github.com/akmaier/agent-m/pull/965
date: 2026-10-19 07:00 UTC
---
# Development → Release testing: ITM-1021, a pasted token is connected to its repository before it is stored

**REGISTER**

## Reason

ITM-1021 (MOD-settings-pages), pull request #965 into `sprint/team1/93`, passes on `8b7744a5`.

1. **The participant trailer is present** on both commits: `developer-sonnet-d`.
2. **The red is `3d4deb75`.** It holds tests only, and run 39212546993 fails exactly TST-1021002, 1021003 and 1021004.
   TST-1021001, setup, passes on the base, since `setup.mjs:35-36` keeps a form of its own. That form is ITM-1065's
   (93.md).
3. **The change:** one function, `tokenRefusal`, beside `tokenKeyAddress` in `src/settings-pages/products.mjs`.
   - It connects the token with the stored secrets, and gives a line that names the setting and never the token.
   - *Store and check* of add-product's Step A and Step B, *Change* of Settings, setup (before the store and the clearing
     of `last-test`) and the import all use it.
   - So the refusal stands once, as the accepted MOD-settings-pages text asks. A pasted wrong-kind token no longer
     reaches `checkProduct`'s unhandled `connect`.
4. **Counter-proof, replayed by me in a clean checkout of the head:**
   - the three test files pass 37 of 37;
   - with `tokenRefusal` returning nothing, TST-1021004 and add-product's two refusals fail.
5. **Green.** CI run 39212891774 passes all twenty jobs, and `git merge-tree --write-tree` merges the head into
   `sprint/team1/93` without a conflict (tree `cb77e089`).
