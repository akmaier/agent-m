---
id: ITM-650
title: The tests that read a document for their expected result are listed
level: module
realises:
  - A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT
modules:
  - MOD-test-document
builds_on:
tests:
  - unit
origin:
  - ITM-597's gate on pull request #690 (docs/gates/20261017-0533-development-release-testing-7f40.md), from developer-sonnet-d's finding
---
# ITM-650 The tests that read a document for their expected result are listed

**REGISTER**

## Outcome

SPEC.md names `tests/test_expected_results_stated.py` as the Check of `A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A
DOCUMENT`, and the file does not exist (`ls` fails, and the same `ls` finds `tests/test_test_battery.py`). The SPEC queue
`2026-10-17c` covers only `tests/test_spec_browser.py`.

The Check as written: it "lists every test that names a module and reads `SPEC.md`, a file under `docs/use-cases/` or a
file under `docs/architecture/` when it runs, for review; the decision stays human". Which module owns the check, and so
which module this item builds in, is read at the start. MOD-test-document is named for now, because it reads test
declarations.

## Acceptance

- `tests/test_expected_results_stated.py` lists every test that names a module and reads one of those documents when it runs.
- Its counter-proof: a fixture test that compares a function's result with a value read from a module file is listed, and the same test stating its value is not.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
