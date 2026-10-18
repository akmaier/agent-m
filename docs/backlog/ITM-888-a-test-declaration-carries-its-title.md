---
id: ITM-888
title: A test declaration carries its title
level: module
realises:
  - UC-029
  - EVERY TEST HAS ONE LEVEL
modules:
  - MOD-test-document
builds_on:
tests:
  - unit
origin:
  - po-opus-b's settling of ITM-766's question at sprint team2/89's start, 2026-10-18
---
# ITM-888 A test declaration carries its title

**REGISTER**

## Outcome

UC-029 step 1 asks that each test show "a one-line title" (UC-029:35-37). MOD-test-document's `TestDeclaration` carries
`title`, as the draft committed as `c2f0a91e` states it: for a manual test the heading's `<title>`; for a test in code the
name the test case gives itself on the first line after the declaration — its first string literal, or else the name it
defines —; `null` where neither is found. `testDeclarations` reads it for every declaration.

It waits for akmaier's acceptance of that draft of MOD-test-document's file.

## Acceptance

- With fixture test files: a manual test's heading title; a `test("…")` case's title in JavaScript; a Python
  `def test_…` case's name; `null` for a declaration with neither. Expected values literal.
- The existing tests of `testDeclarations` stay green; those that compare a whole declaration gain `title`.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-document/` and the tests that name MOD-test-document change.
