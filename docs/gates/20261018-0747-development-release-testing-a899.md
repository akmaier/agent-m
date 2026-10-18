---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 8a6eaeee48072fbeb02cc99d9aa32c043e4e48d1
  - https://github.com/akmaier/agent-m/pull/859
date: 2026-10-18 07:47 UTC
---
# Development → Release testing: ITM-899, the source library and the participants page connect their hosts with the stored secrets

**REGISTER**

## Reason

ITM-899 (MOD-settings-pages), pull request #859 into `sprint/team1/88`, passes on `8a6eaeee`.

1. **The stop clause did not stop the item.** Two of the five calls commit:
   - `library.mjs:207`, through `commitPlan` → `commitTo` → `host.commitFiles`;
   - `library.mjs:236`, a product's host for *Move*, through `saveLinks` → `saveFile` → `commitFiles`.
   The other three only read.
2. **Red first.** `c9311016` holds only `tests/settings-pages-library-refuses-secret.test.mjs`. Run 39108536901 is red on
   exactly TST-899001 (a new version, through `:207`) and TST-899003 (*Move*, through `:236`). The known positives
   TST-899002 and 899004 pass on the base.
3. **The change** is only in `src/settings-pages/library.mjs` and `participants.mjs`. The five calls connect with
   `{ ...credentialsFor(store, address), secrets: secretValues(context.store) }`, the form ITM-868 and ITM-883 use, through
   MOD-browser-store's index, which MOD-settings-pages' Uses name.
4. **Green.** Run 39108747019 on `8a6eaeee` passes all twelve jobs. `git merge-tree --write-tree` merges the head into
   `sprint/team1/88` without a conflict (tree `9a23059d`).
5. **The Acceptance holds.**
   - I replayed a counter-proof in a clean checkout of the head: with `:207` connecting without `secrets`, TST-899001
     fails and the other three pass. Restored, `src/` is clean.
   - The developer's second counter-proof, on `:236`, fails TST-899003.
   - **Limitation, as ruled for ITM-882:** `library.mjs:225`, `:543` and `participants.mjs:252` only read, so their
     refusal cannot be observed. They pass the option untested, and the pull request names them.
   - This applies `NO SECRET IN THE REPOSITORY` (SPEC.md:37).
6. **Release and system tests (agreement 83).** Every release and system test that imports `src/settings-pages/` ran on
   the head, with the library's unit tests and the Bridge packages installed as CI does: 133 of 133.

**Leads from the developer:** `release-itm-290` hits the local Electron lock, and `test_expected_results_stated` lacks
the Bridge packages locally. Both depend on the machine and are green in CI. No item is needed.

**developer-sonnet-a's next item is ITM-705.**
