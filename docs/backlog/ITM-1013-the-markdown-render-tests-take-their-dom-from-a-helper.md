---
id: ITM-1013
title: The renderer's tests take their DOM from a helper, not from a test file
level: unit
realises:
  - A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
modules:
  - MOD-markdown-render
builds_on:
tests:
  - unit
origin:
  - ITM-670's pull request #939 (sprint team1/92), from developer-sonnet-d's finding
---
# ITM-1013 The renderer's tests take their DOM from a helper, not from a test file

**REGISTER**

## Outcome

`tests/markdown-render-342.test.mjs`, `markdown-render-343.test.mjs` and `markdown-render-release-20.test.mjs` import
`tests/markdown-render.test.mjs` for its small DOM, so each also runs that file's tests. Sprint 56's agreement: "A shared
test harness lives in a helper file of its own, never in a test file."

## Acceptance

- The DOM is in a helper, `markdown-render.test.mjs` and the three importers import it, and no test imports a test file.
  No expected result changes. It is declared as refactoring: CI is green on every commit.
