---
id: ITM-624
title: The add-product tests' harness is a file of its own
level: module
realises:
  - UC-001
modules:
  - MOD-settings-pages
builds_on:
  - ITM-575
  - ITM-588
tests:
  - unit
origin:
  - ITM-575's gate (docs/gates/20261016-2333-development-release-testing-c53d.md)
---
# ITM-624 The add-product tests' harness is a file of its own

**REGISTER**

## Outcome

`tests/settings-pages-add-product-new-repository.test.mjs` imports `tests/settings-pages-add-product.test.mjs` for its
harness, so that file's tests run again with it. The harness moves to a helper of its own under `tests/`, whose header
names MOD-settings-pages, and both files import the helper. This follows ITM-623, which does the same for the review
pages.

The setup tests use it too. `tests/settings-pages-setup.d/dom.mjs` (ITM-588) holds a copy of the DOM part `explain` needs,
taken from the add-product tests. That copy goes, and the setup tests import the same helper (nothing twice).

It is a refactoring of the tests: no expected result changes. The golden master is the list of the test names and
results before and after, less the repeated runs.

## Acceptance

- No test file imports another test file for its harness.
- Every test passes with the same expected values, and each runs once per file that declares it.
