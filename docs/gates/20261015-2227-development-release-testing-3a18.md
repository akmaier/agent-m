---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - ec876e3637b2764d81f26de938f279295f4f992a
  - https://github.com/akmaier/agent-m/pull/520
date: 2026-10-15 22:27 UTC
---
# Development → Release testing: ITM-482, A browser tab keeps values of its own

**REGISTER**

## Reason

ITM-482, pull request #520 by developer-sonnet-a into `sprint/team1/28`, head `ec876e36`.

1. The tests-only commit `a540b3d6` was red (run 38811383439).
2. CI is green on the head (run 38816976947, ten of ten jobs).
3. Changed are `src/browser-store/index.mjs` and `src/browser-store/store.mjs`, the item's module, and the new
   `tests/browser-store-tab-values.test.mjs` of MOD-browser-store. The merge of the sprint's branch brings nothing else.
4. TST-482001 to TST-482003 name their module and the requirement they guard; counter-proofs are recorded in #520.
5. The Acceptance holds:
   - A tab value is read back in its tab and removed by `null`.
   - It is kept in `sessionStorage` under the instance's prefix, never in `localStorage`.
   - The list, the export and an import hold none.
   - `StorageUnavailable` is thrown where `sessionStorage` cannot be used.

Noted for the review: MOD-browser-store's file does not say whether `clearEverything` removes the tab's values; it is
built so that it does not, and the item does not ask for it.
