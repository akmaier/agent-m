---
id: ITM-1414
title: A test without an identifier is listed as incomplete
level: module
realises:
  - UC-029
  - EVERY ARTIFACT HAS AN IDENTIFIER
modules:
  - MOD-test-document
  - MOD-trace-pages
builds_on:
  - ITM-774
tests:
  - unit
origin:
  - UC029-F1, TST-774209 of ITM-774's system tests of UC-029 (#1713), ruled at its gate in team1's sprint 142 (docs/gates/20261102-0823-development-release-testing-0774.md)
---
# ITM-1414 A test without an identifier is listed as incomplete

**REGISTER**

## Outcome

UC-029 1a: "A test declares no `TST-` identifier, no level or no guarded identifier. It is listed under **Incomplete**, with
what is missing." The tests view reads the declarations through `declarationsOf` (`src/trace-pages/tests.mjs:35-40`), which
takes MOD-test-document's `testDeclarations`. That yields nothing for a case whose comment names no `TST-` identifier, so
such a case is never listed as incomplete.

## The reading taken

MOD-test-document's Data lists `TST-<nnn>` among the keys of a declaration, "required", and its `testDeclarations` "never
throws on content: a declaration missing a key is read with that key `null`, and `testFindings` names it". So a comment
block of `key: value` lines whose first line names no `TST-` identifier is a declaration missing that key. `testDeclarations`
reads it with `id` `null`, and `testFindings` names the missing identifier. The tests view lists it under **Incomplete** from
what `testDeclarations` gives. No caller inserts a stand-in identifier. `TestDeclaration`'s `id: string` does not show the
`null` the Data allows; that is noted for akmaier. Before the code, the probe names every caller of `testDeclarations` that
would now meet an `id` of `null`.

## Waiting for akmaier

The probe of the reading above found that it reaches far beyond this item:
- `testDeclarations` would give `id` `null` to 57 blocks of this repository's own tests (ITM-1429 gives them identifiers).
- Every caller of `testDeclarations` would meet `id` `null`, and several key what they build by `id`: MOD-trace-graph,
  MOD-release-evidence, MOD-result-records, MOD-product-process (the Definition of Done), MOD-runtimes,
  MOD-maintenance-pages, and others. A product's tests may hold such blocks too.
- The expected results of `tests/test_identifiers.py` and TST-1169002 move.

Inserting a stand-in identifier from MOD-trace-pages was rejected at the gate (docs/gates/20261102-0903-development-release-testing-1414.md).

The general change is one function of MOD-test-document that gives the comment blocks of a test file that look like a
declaration but name no identifier, with their path and line. The tests view lists them under **Incomplete**, and no caller
of `testDeclarations` changes. That is a change of MOD-test-document's interface, for akmaier.

## Acceptance

- A test case whose declaration has a level and a guard but no `TST-` identifier is listed under **Incomplete**, naming the
  missing identifier. The other tests are listed as before.
- TST-774209 loses its `todo` in a commit by a participant other than the implementer, written after the code is pushed.
- No other existing expected result changes, unless a probe names it and the accepted text allows it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
