---
id: ITM-701
title: UC-014's release test reads the label Why these?
level: system
realises:
  - UC-014
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-settings-pages
builds_on:
  - ITM-628
tests:
  - release
origin:
  - ITM-628's gate on pull request #719 (docs/gates/20261017-1016-development-release-testing-8f15.md), from developer-sonnet-e's finding
---
# ITM-701 UC-014's release test reads the label Why these?

**REGISTER**

## Outcome

UC-014 step 7: "A folded **Why these?** says what each is for". TST-627006's *Why these?* subtest
(`tests/release-uc-014-setup-route.test.mjs`, ITM-679) checks that a fold of Step A names the permissions. It passes
with the label dropped, so it does not check the label the use case names. The subtest also asserts that the fold
naming the permissions reads *Why these?*. A participant who builds none of ITM-628 changes it
(`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

**Settled at sprint team1/71's start. Selectable.**
- It changes `tests/release-uc-014-setup-route.test.mjs` alone. Its header names MOD-settings-pages.
- It is written by developer-sonnet-b, who wrote ITM-679 and builds none of ITM-628.
- **Sprint 70's agreement:** the whole release file is run on the draft, and every changed case is named.
- **Reads:** none.

## Acceptance

- The subtest fails when Step A's permissions fold reads anything but *Why these?*, and passes on ITM-628's code.
- It is written by a participant other than developer-sonnet-e.
- Its counter-proof is the label dropped, which fails it.
- Its `# TODO ITM-628` mark goes, since ITM-628 is merged and the subtest passes (sprint 70's end gate).
