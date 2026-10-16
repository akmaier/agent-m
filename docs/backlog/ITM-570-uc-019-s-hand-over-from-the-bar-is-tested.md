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

**The readings, settled at sprint team1/56 for sprint 57:**
- **Where it runs.**
  - CI runs Node 22 (`.github/workflows/tests.yml:31, 75`), where `tests/system-uc-019-change-by-prompt.test.mjs`
    loads, and CI's evidence decides the gate.
  - On Node 26 the file fails to load for ITM-566's cycle. Local runs therefore preload
    `src/model-catalogue/index.mjs` (`node --import <a file importing it>`), as the developers of ITM-571 and ITM-572 did.
  - ITM-566 does not have to come first.
- **The kind.**
  - `implement-item` is in no catalogue, and the task "Run the tests of UC-007" is no change by prompt.
  - UC-019 6b hands over "the work" of the change itself: "The workflow runs the correction loop of step 7 ... commits
    the draft ... a use case as open".
  - So the fixture's proposal names `change-use-case`, works on UC-007, and carries a change of UC-007 as its task.
  - Its strategies are handed since ITM-572 (`tests/site-frame-start-hand-over-review.test.mjs`, TST-572002, lists it
    among the kinds that prepare).
- **The NotFound.**
  - Under the preload, the test today ends with "It could not be checked whether this can start. NotFound:
    https://github.com/akmaier/lending-tool was not found." That was run on `68ffaed4` by the Product Owner.
  - The developer first logs the fixture's requests and names the one that answers `404`. If the fixture's product
    server does not serve a request a real GitHub answers, the fixture serves it, and only test files change.
  - If the product reads something a real GitHub would also refuse, that is a defect of the product, and it becomes an
    item, as the Acceptance says.

The test is turned plain by a developer who implemented none of ITM-505.

## Acceptance

- TST-377013 passes as a plain test, and a planted fault in the hand-over's assessment fails it.
- Only test files change, unless the reading of the NotFound names a defect of the product, which then becomes an item.
