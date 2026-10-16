---
id: ITM-625
title: The release panel's tests wait by the clock for what they expect
level: module
realises:
  - UC-013
modules:
  - MOD-test-pages
builds_on:
  - ITM-569
tests:
  - unit
origin:
  - sprint team1/56's Release testing gate (docs/gates/20261016-2339-release-testing-sprint-review-f2d3.md): TST-473094 failed once in CI on a slow runner and passed on a re-run
---
# ITM-625 The release panel's tests wait by the clock for what they expect

**REGISTER**

## Outcome

`tests/test-pages-release.test.mjs` waits after each of its 14 clicks with `settle` (`:273`). `settle` stops once the
page's text has stayed the same for five turns of zero milliseconds. A click whose handler crosses WebCrypto can stay
unchanged that long on a slow runner and finish later, and so TST-473094 once read the text before its message arrived.

Each wait becomes the condition the test then asserts, bounded by ten seconds of the clock and naming what it waited
for. That is the `until` of `tests/prompt-bar.d/until.mjs`, which ITM-569 made.

**The readings, settled at sprint team1/56 for sprint 57:**
- **Nothing twice.** The file imports the existing `until` and copies none. The helper's header gains MOD-test-pages
  beside the modules it names, and its list of the files that use it gains this one.
- **No expected result changes.** The tests' assertions and their values stay; only how long each waits, and for what,
  changes. The golden master is the list of the six tests and their results before and after.
- **Reachable through the real host:** nothing changes in the product.

## Acceptance

- No wait in the file is bounded by turns.
- A planted handler that answers after ten turns still passes; one that never answers fails with "never: <what>".
- The six tests pass with their expected values unchanged.
