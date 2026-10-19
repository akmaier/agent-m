---
id: ITM-1066
title: The tests' copies of the fixture DOM give way to the helpers
level: unit
realises:
  - A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
modules:
  - MOD-markdown-render
builds_on:
  - ITM-1013
  - ITM-1012
tests:
  - unit
origin:
  - ITM-1013's pull request #968 (sprint team1/93), from developer-sonnet-a's finding
---
# ITM-1066 The tests' copies of the fixture DOM give way to the helpers

**REGISTER**

## Outcome

Nine test files say that their DOM is "that of tests/markdown-render.test.mjs". They hold copies of it, not imports:
- `tests/site-frame-dom.mjs` and `site-frame.test.mjs`;
- `review-pages-harness.mjs` and `review-pages-use-cases.test.mjs`;
- `settings-pages-harness.mjs` and `settings-pages-add-product.test.mjs`;
- `implementation-pages.test.mjs` and `implementation-pages-uc-002-findings.test.mjs`;
- `test-pages-release.test.mjs`.

Since ITM-1013, the renderer's DOM stands in `tests/markdown-render-dom.mjs`, so the comments point to a file that no longer
holds it. Copies that nothing keeps equal break "nothing twice".

**First task:** list each copy's differences from `tests/markdown-render-dom.mjs` and `tests/site-frame-dom.mjs`, as
ITM-1012 does for the settings harness. A copy whose behaviour a test needs stays and says so. The rest import a helper.

## Acceptance

- No test file holds a copy of a fixture DOM that a helper gives, and no comment names a file that no longer holds what it
  says. Every test passes with no expected result changed.
- It is declared as refactoring: CI is green on every commit.
