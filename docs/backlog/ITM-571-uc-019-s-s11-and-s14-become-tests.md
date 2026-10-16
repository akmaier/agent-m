---
id: ITM-571
title: UC-019's S11 and S14 become tests
level: system
realises:
  - UC-019
modules:
  - MOD-review-pages
builds_on:
  - ITM-559
tests:
  - system
  - release
origin:
  - ITM-559's settling at sprint team1/51: the todo tests TST-377012 (S11) and TST-418126 (S14) hold once ITM-559 is merged
---
# ITM-571 UC-019's S11 and S14 become tests

**REGISTER**

## Outcome

Once ITM-559 is merged, two `todo` tests hold, and they become plain tests with their expected values kept:
- TST-377012 (S11, `tests/system-uc-019-change-by-prompt.test.mjs:410`);
- TST-418126 (S14, `tests/release-uc-019-change-requirements-by-prompt.test.mjs:597`).

Their entries move from the findings maps to the evidence maps, as ITM-563 moved S7, S8 and S15. The author implements
none of ITM-559 (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- **The tests.** Both pass as plain tests. A planted fault in each mend fails its test.
- **Only test files change.** The release test records its local run before and after.
