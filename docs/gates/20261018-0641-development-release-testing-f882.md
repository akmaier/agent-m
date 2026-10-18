---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 212356a81b881cdc1d6215a5aaf76c1d6e8156ca
  - https://github.com/akmaier/agent-m/pull/848
date: 2026-10-18 06:41 UTC
---
# Development → Release testing: ITM-882, the live app connects its hosts with the stored secrets

**REGISTER**

## Reason

ITM-882 (MOD-site-frame), pull request #848 into `sprint/team1/87`, passes on `212356a8`.

1. **Red first.** `720499d0` holds only `tests/site-frame-app-hosts-refuse-secret.test.mjs`. Run 39104077875 is red on
   exactly TST-882001 to 882006. The second commit changes no test.
2. **The change** is only in `src/site-frame/dashboard-app.mjs`:
   - one `secrets()`, read through MOD-browser-store's `secretValues`, which MOD-site-frame's Uses name;
   - every host the app connects passes it: `:214`, `:437-438`, `:536`, `:654`, `:766` and `:768`;
   - the long-lived `currentHost` (`:213-218`) and `instanceHostFollowingToken` reconnect when the token or a secret
     changes, as the frame's `instanceHostFollowingStore` does (reading 1 in 87.md).
3. **Green.** Run 39104645285 on `212356a8` passes all twelve jobs. `git merge-tree --write-tree` merges the head into
   `sprint/team1/87` at `7014787e`, which holds #845, #846, #847 and #849, without a conflict (tree `48ea594a`).
4. **The Acceptance holds.**
   - I ran the file on the head: 6 of 6.
   - I replayed a counter-proof in a clean checkout of the head: with `:214` connecting without `secrets`, 3 of 6 fail.
     Restored, it passes 6 of 6 and `src/` is clean.
   - The developer's counter-proofs, one per committing path and one for the change of key, each fail only their own
     tests.
   - **Limitation, as ruled in 87.md:** `:536` and `:437-438` are read-only hosts. They pass `secrets` untested, because
     no caller commits through them. The pull request names them.
5. **Release tests (agreement 83).** Every release test that imports `dashboard-app.mjs` or loads it through
   `tests/app-harness.mjs` ran on the head, with the Bridge packages installed as CI does. That is eighteen release files with
   the item's test: 161 tests, 154 pass, 5 todo, and 2 failures in one file, `release-sprint-16-practice-workflow`.
   - That file fails to load with "ReferenceError: Cannot access 'routes' before initialization" under the local Node
     v26.
   - It fails the same way with the base's `dashboard-app.mjs` in the same checkout, so the item does not cause it.
   - CI's run 39104645285, on its own Node, is green.

**developer-sonnet-e's next item is ITM-878, once ITM-879 is merged into the sprint.**
