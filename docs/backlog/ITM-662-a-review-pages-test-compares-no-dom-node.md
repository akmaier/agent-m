---
id: ITM-662
title: A review-pages test compares no DOM node
level: module
realises:
  - A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
modules:
  - MOD-review-pages
builds_on:
tests:
  - unit
origin:
  - ITM-601's gate on pull request #703 (docs/gates/20261017-0730-development-release-testing-5f81.md), from developer-sonnet-d's finding
---
# ITM-662 A review-pages test compares no DOM node

**REGISTER**

## Outcome

`tests/review-pages-failure-after-snapshot.test.mjs:73` (TST-521101) asserts `assert.equal(target.children.at(-1),
problems[0])`, a comparison of two DOM nodes. Sprint 65's agreement reads: "An assertion on a DOM node compares a
boolean or a string, never the node." When such an assertion fails, its message walks the cyclic DOM, which is how
TST-597007 hung.

The assertion becomes a boolean, such as whether the last element is the problem paragraph. Its expected result is
unchanged.

## Acceptance

- The test asserts the same fact as a boolean, and no expected result changes. It is declared as refactoring.
- A planted fault that puts another element last fails it at once, without hanging.
