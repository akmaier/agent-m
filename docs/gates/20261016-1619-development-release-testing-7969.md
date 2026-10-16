---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 2bb99e5784aada3dca237042f89f192c79084931
  - https://github.com/akmaier/agent-m/pull/603
date: 2026-10-16 16:19 UTC
---
# Development → Release testing: ITM-553, The settings disclosure check covers the recording switch

**REGISTER**

## Reason

ITM-553, pull request #603 into `sprint/team1/47`, at head `2bb99e57`. developer-sonnet-e wrote it and implemented none of
ITM-511, as the item asks. It lists AGENTS.md, SPEC.md, UC-042, MOD-settings-pages, the item, `47.md` and chapters 9, 11,
12 and 13 as read in full.

1. **No red commit is required.** The item tests behaviour that ITM-511 built. The counter-proof:
   - the public filter of the notice was planted to let private repositories through as well;
   - `test_a_private_product_is_not_named_as_public` then fails, naming the private product in "Reported as public";
   - restored, the suite passes.

   The listing of `/private/tmp/claude-501/` was the same before and after the work.
2. **CI is green on the head**: ten of ten jobs. GitHub reports the pull request mergeable.
3. **The changes stay in the item's scope.** Only `tests/test_settings_disclosure.py`, whose header names
   MOD-settings-pages. Its guards add `SWITCHING CONVERSATION RECORDING ON STATES WHAT FOLLOWS`, and a new class holds
   three cases. It reaches the switch through `jsrun`'s `js()`, rendering `settingsPagesSettings.route` with fixture hosts,
   as the item settles. No code changes. Locally, the file gives 14 of 14, where it gave 11 before, and the header
   checks pass.
4. **The cases state their values.**
   - Nothing is stored before the tick, and a commit after it is the known positive.
   - The notice's statements name the instance and the public product.
   - The private product is named nowhere.
5. **The Acceptance holds.** The case passes on the head and fails under the planted fault, and the header guards the
   rule. Since the developer implemented none of ITM-511, its author is not the implementer of the behaviour it checks.

The reading that the instance counts as published, because its fixture server reports it public, follows
MOD-settings-pages: it "names each of the instance's and the products' repositories that its server reports as public".

## The gap the developer found

SPEC.md names `tests/test_expected_results_stated.py` as the check of `A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A
DOCUMENT`, and the file does not exist. ITM-518 (MOD-test-document) already registers exactly this check, with the
counter-proof the SPEC names, so no new item is needed. ITM-518 was named among Team 2's items that waited for Team 1's
modules (sprint 45, "For Team 2"). Which team selects it is left to the next start decision that finds it free.
