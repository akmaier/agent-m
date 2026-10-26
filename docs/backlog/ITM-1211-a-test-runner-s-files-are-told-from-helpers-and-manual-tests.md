---
id: ITM-1211
title: A test runner's files are told from helpers and manual tests (isNamedTestFile)
level: module
realises:
  - THE CI CONFIGURATION IS GENERATED FROM THE SCHEDULE
  - UC-027
modules:
  - MOD-test-document
builds_on:
  - ITM-744
tests:
  - unit
origin:
  - ITM-476, split after akmaier accepted MOD-test-document on 2026-10-26 (33f3ab1b)
---
# ITM-1211 A test runner's files are told from helpers and manual tests (isNamedTestFile)

**REGISTER**

## Outcome

MOD-test-document's `isNamedTestFile(path) -> boolean` (MOD-test-document.md, Interfaces): whether a path is named as
tests are named in its language, as Data defines it, wherever it lies — the files a test runner runs, as against a
helper, a fixture or a Markdown file of manual tests, which `isTestFile` counts by their folder alone. MOD-test-schedule's
`testsOfRow` (ITM-1213) uses it.

## Acceptance

- Unit tests naming MOD-test-document: a named test file in `tests/` and outside it is one; a helper and a fixture under
  `tests/`, and a manual test in Markdown, are none. Counter-proof: `isTestFile` holds for each of the latter.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-document/` and the tests that name MOD-test-document change.
