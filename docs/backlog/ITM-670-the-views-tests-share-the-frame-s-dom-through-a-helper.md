---
id: ITM-670
title: The views' tests share the frame's DOM through a helper
level: module
realises:
  - A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
modules:
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - ITM-599's gate on pull request #708 (docs/gates/20261017-0836-development-release-testing-e7a1.md), from developer-sonnet-d's finding
---
# ITM-670 The views' tests share the frame's DOM through a helper

**REGISTER**

## Outcome

24 test files run `import "./site-frame.test.mjs"` to get its small DOM. So every one of them also runs the frame's own
tests, and a fault in those breaks theirs. Sprint 56's agreement reads: "A shared test harness lives in a helper file of
its own, never in a test file."

The DOM moves into a helper of MOD-site-frame's tests, and `site-frame.test.mjs` imports it. The importers name other
modules in their headers: three of MOD-trace-pages, five of MOD-settings-pages, two of MOD-review-pages, one of
MOD-main-page, one system test, and twelve of MOD-site-frame. Whether they move in this item, with those modules among
its own, or in each module's next item, is read at the start.

## Acceptance

- The DOM is in a helper file, `site-frame.test.mjs` imports it, and no expected result changes. It is declared as refactoring.
- CI is green on every commit.
