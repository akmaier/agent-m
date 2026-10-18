---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 8cc4c4bf73fdb7ecf96cf12e9918bcef8c862240
  - https://github.com/akmaier/agent-m/pull/849
date: 2026-10-18 06:39 UTC
---
# Development → Release testing: ITM-883, the add-product route connects its host with the stored secrets

**REGISTER**

## Reason

ITM-883 (MOD-settings-pages), pull request #849 into `sprint/team1/87`, passes on `8cc4c4bf`.

1. **Red first.** `48800e7d` holds only `tests/settings-pages-add-product-secrets.test.mjs`. Run 39104395414 is red on
   exactly TST-883001 and 883002. TST-883003, the known positive, passes on the base. The second commit changes no test.
2. **The change** is only in `src/settings-pages/products.mjs`:
   - the add-product host at `:371` connects with `{ ...credentials, secrets: secretValues(context.store) }`;
   - the four `checkProduct` calls pass the same option;
   - `secretValues` is imported from MOD-browser-store's index, which MOD-settings-pages' Uses name.
3. **Green.** Run 39104592195 on `8cc4c4bf` passes all twelve jobs. GitHub reports #849 as mergeable.
4. **The Acceptance holds:** "the add-product route's hosts pass `secrets: secretValues(store)`, and a layout commit that
   holds a stored secret is refused with `SecretRefused`".
   - I ran the file on the head: 3 of 3.
   - I replayed the counter-proof in a clean checkout of the head: with `:371` back at `connect(address, credentials)`, 2 of
     3 fail. Restored, `src/` is clean.
   - **Limitation, as ruled for ITM-882:** the `checkProduct` hosts only read, so their refusal cannot be observed. They
     pass the option untested, and the pull request names them.
5. **Release tests (agreement 83).** Every release test that imports `src/settings-pages/` ran on the head, with
   `settings-pages-add-product` and the Bridge packages installed as CI does: 58 of 58.

**GitHub's push protection** declined the first push, over the token-shaped fixture `glpat-TEAM0123456789abcdef`. The
developer amended the unpushed commit to `glpat-TEAM0123456789`, a fixture already on `main`
(`tests/settings-pages-add-product.test.mjs`). No pushed commit was rewritten, and the protection was not bypassed. That is
accepted: the fixture is no secret, and a shorter fake value is not a way around the check.

**developer-sonnet-a may start ITM-884 once #849 is merged.**
