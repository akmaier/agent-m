---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - a3bebf846392a2250a8aafc9bee7ecc06963dbfb
  - https://github.com/akmaier/agent-m/pull/844
date: 2026-10-18 06:15 UTC
---
# Development → Release testing: ITM-868, a host the settings page reconnects still refuses a stored secret

**REGISTER**

## Reason

ITM-868 (MOD-settings-pages), pull request #844 into `sprint/team1/87`, passes on `a3bebf84`.

1. **Red first.** The first commit, `08f61ceb`, holds only `tests/settings-pages-reconnect-refuses-secret.test.mjs`.
   Run 39102882645 is red on it in node (7) with exactly TST-868001 to 868010. TST-868011, the known positive, passes.
   The second commit changes no test (`git diff 08f61ceb a3bebf84` touches only `src/`).
2. **The change.** `reconnectHosts` (`src/settings-pages/settings.mjs:413-417`) connects with
   `{ ...credentialsFor(context.store, address), secrets: secretValues(context.store) }`. That is the frame's own option
   (`src/site-frame/routing.mjs:66`) and sprint 81's agreement. `secretValues` is imported from MOD-browser-store's
   index, which MOD-settings-pages' Uses name (MOD-settings-pages.md:27, accepted at `8a69b050`).
3. **Green.** Run 39103078342 on `a3bebf84` passes all twelve jobs. Its log shows `ok 229` to `ok 239`, TST-868001 to
   868011. Seven node jobs end `# fail 0` in the saved log; node (2)'s totals are cut from it, and that job's conclusion
   is success.
4. **The Acceptance holds:** "After every reconnect of the settings page, a commit that holds a stored secret is refused,
   and the tests pin each path."
   - I ran the file on the head: 11 of 11.
   - I replayed the counter-proof in a clean checkout of the head: with `secrets` removed from the reconnect, 10 of 11
     fail and the known positive passes. Restored, the checkout is clean.
   - The developer's split counter-proofs agree: the product's reconnect fails 001 to 005, the instance's 006 to 010.
   - This applies `NO SECRET IN THE REPOSITORY` (SPEC.md:37).
5. **Release tests (agreement 83).** Every release test that imports a file of `src/settings-pages/` was run on the head,
   with the Bridge packages installed as CI does (`npm install --prefix src/bridge-build --omit=dev --ignore-scripts`):
   - `release-itm-269`, `-280`, `-287`, `-288`, `release-uc-003-direct-endpoint`, `release-uc-014-setup-route` and
     `release-uc-042-token-failures`: 35 of 35 after the install;
   - `release-uc-003-dashboard-https-bridge`: passes too.
   Before the install, `release-itm-269` failed to load on `imapflow` only.

**developer-sonnet-a may start ITM-870 from `sprint/team1/87` once #844 is merged.** ITM-870 builds on ITM-868 in the
same module.
