---
id: ITM-553
title: The settings disclosure check covers the recording switch
level: component
realises:
  - SWITCHING CONVERSATION RECORDING ON STATES WHAT FOLLOWS
modules:
  - MOD-settings-pages
builds_on:
  - ITM-511
tests:
  - component
origin:
  - ITM-511's gate (#599): SPEC.md names tests/test_settings_disclosure.py as the check of SWITCHING CONVERSATION RECORDING ON STATES WHAT FOLLOWS, and the file has no case for it
---
# ITM-553 The settings disclosure check covers the recording switch

**REGISTER**

## Outcome

`tests/test_settings_disclosure.py`, MOD-settings-pages' test and the check SPEC.md names for the rule, gets a case for
*Recording conversations*, as the rule's check states it: "the switch stores nothing before the notice is acknowledged,
and the notice names a fixture public product; counter-proof: a private product is not named as public". Its header
adds the rule to its guards.

How the case reaches the switch, settled from the file and from `tests/jsrun.py`:
- **The entry point.** The file's cases call the site's modules through `js()`, which imports each module by its name
  and runs an `async` expression in Node.
- **What is exported.** `src/settings-pages/settings.mjs` exports only `route`, which jsrun reaches as
  `settingsPagesSettings.route`, and the recording line's notice is not exported.
- **The case itself.** It renders that route in a small DOM, with an instance and two fixture products, one public and
  one private, behind fetch fixtures. It builds that DOM inside its expression, or imports a helper from `tests/` with
  `await import(…)`, as ITM-511's node tests build theirs.
- **No source change.** It adds no export: only the test file changes.

Only the test file changes. The behaviour is ITM-511's, so a red first commit is not required; the counter-proof is a
planted fault that names a private product as public.

## Acceptance

- **The case.** It passes on the head, and a planted fault in the notice makes it fail. The run is recorded.
- **The header.** It guards `SWITCHING CONVERSATION RECORDING ON STATES WHAT FOLLOWS`.
- **The author** implemented none of ITM-511.
