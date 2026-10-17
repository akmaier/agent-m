---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 23132f94fc47dbe6ce126db74b69582e658f2e36
  - https://github.com/akmaier/agent-m/pull/761
date: 2026-10-17 20:00 UTC
---
# Development → Release testing: ITM-810, the settings Checks run on the settings pages

**REGISTER**

## Reason

ITM-810, pull request #761 into `sprint/team1/75`, at head `23132f94`. It is mergeable, and run 39064624960 passed ten of
ten. It changes six files, +518/−233. Neither old file is deleted, as `75.md` (19:44 UTC) narrowed it.

**Red, then code.** The tests-only commit `6a7b7627` was red in run 39064460082:
- node (3): the two cases of the new `settings-pages-paired-bridge-test.test.mjs`;
- python (1): `test_the_paired_bridge_can_be_tested`.

The code was pushed after the run had ended.

**The rulings are met.**
- The three SPEC Checks (`test_settings_page.py`, `test_settings_disclosure.py`, `test_token_scope_documented.py`) run on
  the live `settings` route through the new helper `tests/settings_pages_page.py`.
- The pseudonymisation case asserts the three statements of `SWITCHING PSEUDONYMISATION OFF STATES WHAT FOLLOWS`. The live
  page already makes them, and the four extra words went as named changes.
- The quoted words of UC-042, *works*, *expires on …* and *refused*, are on the page and asserted.
- **The paired Bridge's fault is fixed.** Its line in `src/settings-pages/settings.mjs` gets *Test*, through
  MOD-bridge-client's `testBridge` and `bridgeAt`, which are in the module's Uses. The result is kept as
  `last-test:bridge`, and *Clear* clears it. `A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN` now holds for
  it.

**No other result changes.**
- All 79 release files give the same results as the base.
- release-sprint-02-a's ITM-129 and ITM-130 no longer change, so no release-test item is needed.
- `#settings` makes 8 requests with a token and 8 without, as before. The Bridge line makes none when drawn, and 2 on
  *Test*, to the stored address with the stored token.
- Six planted faults are caught, and ITM-018 passes.

**Team 2.** ITM-810 changes MOD-settings-pages. Its file uses none of the modules team 2's sprint 76 changes, and the modules
team 2's items use do not include MOD-settings-pages (SPEC.md:1663).

**Findings.**
- **The notifications line without the notified-file count.** `MOD-settings-pages.md:135-137` asks for it. It is no Check
  of this item, so it is registered as ITM-821 and does not hold this gate.
- **`test_the_store_has_no_product_setting`** still guards the old `writes.savePseudonymisation` path. That is
  ITM-713's.
