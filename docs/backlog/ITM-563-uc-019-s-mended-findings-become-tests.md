---
id: ITM-563
title: UC-019's mended findings become tests
level: system
realises:
  - UC-019
modules:
  - MOD-review-pages
  - MOD-trace-pages
builds_on:
  - ITM-514
  - ITM-558
  - ITM-562
tests:
  - system
  - release
origin:
  - ITM-514's todo findings, which ITM-558 (S7, S8) and ITM-562 (S15) mend
---
# ITM-563 UC-019's mended findings become tests

**REGISTER**

## Outcome

ITM-514 left the defects it found as `todo` tests in UC-019's system and release tests. Each finding that ITM-558 and
ITM-562 mend turns from `todo` into a plain test:
- S7: TST-418007;
- S8: TST-418008;
- S15: TST-377116.

The other findings stay `todo` and name their item:
- S9 and S13: ITM-560;
- S10: ITM-561;
- S11 and S14: ITM-559, which waits for ITM-564 and a draft;
- S12: ITM-505.

The author implements none of ITM-558, ITM-559, ITM-562 or ITM-551 (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- **The tests.** The four tests pass as plain tests on the sprint branch. A planted fault in each mend fails its test.
- **Only test files change.** The release tests record their local run before and after.
