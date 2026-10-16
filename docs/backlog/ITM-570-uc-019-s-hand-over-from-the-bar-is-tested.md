---
id: ITM-570
title: UC-019's hand-over from the bar is tested
level: system
realises:
  - UC-019
  - UC-049
modules:
  - MOD-prompt-bar
builds_on:
  - ITM-505
tests:
  - system
origin:
  - sprint team1/50's end gate (docs/gates/20261016-1938-release-testing-sprint-review-ca9f.md): TST-377013 (S12), UC-019 6b, still fails under its todo mark after ITM-505
---
# ITM-570 UC-019's hand-over from the bar is tested

**REGISTER**

## Outcome

TST-377013 (`tests/system-uc-019-change-by-prompt.test.mjs:421`) is UC-019 6b, "the author hands the work to GitHub
Actions from the bar". It still fails under its `todo` mark, after ITM-505. Run 38956106197, node job 117159254695,
shows:
- its proposal names the kind `implement-item`, works on ITM-001, with the task "Run the tests of UC-007";
- the bar says "It could not be checked whether this can start. NotFound: https://github.com…", so *Hand over* is not
  offered and `namedButton` fails.

**Not ready for a sprint yet.** Before it is selected, its readings are settled from the test's fixture and ITM-505's
code:
- **The NotFound.** Which read of `productFacts` fails in the fixture — a file the fixture product lacks — and whether
  the test's world gives it, or the product should treat it as "unknown".
- **The kind.** Whether `implement-item` is a kind of the catalogue, or should be `implement`, whose recipe waits for
  ITM-568.

The test is turned plain by a developer who implemented none of ITM-505.

## Acceptance

- TST-377013 passes as a plain test, and a planted fault in the hand-over's assessment fails it.
- Only test files change, unless the reading of the NotFound names a defect of the product, which then becomes an item.
