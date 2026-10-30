---
id: ITM-1321
title: One test identifier names one test case
level: module
realises:
  - THE NAME IS THE ID AND IT SURVIVES
  - A REFERENCE NAMES THE IDENTIFIER, NOT THE POSITION
modules:
  - MOD-trace-graph
builds_on:
tests:
  - unit
origin:
  - po-opus-c's release gate of team1's sprint 127 (docs/gates/20261030-1051-release-testing-sprint-review-e127r.md), and the sprint's Review (docs/backlog/sprints/team1/127.md)
---
# ITM-1321 One test identifier names one test case

**REGISTER**

## Outcome

In sprint 127, `tests/release-itm-1187-bar-offers-sessions.test.mjs` declared TST-1187101 to 1187104. Four other cases of
`tests/prompt-bar-endpoints.test.mjs` held those identifiers already. Nothing reported it:
- MOD-test-document's `testDeclarations` and `testFindings` read one file and one declaration at a time;
- no check of the repository compares the declarations of several files;
- CI was green.

The release gate found it by reading the declarations for repeats, and #1526 gave the release cases TST-1187201 to
1187204.

With this item, a test identifier that two declarations hold, in one file or in two, is reported as an error.
- The report names each declaration by its path and line.
- A reference to such an identifier names two cases, so neither is named (A REFERENCE NAMES THE IDENTIFIER, NOT THE
  POSITION).
- The name is the artifact's (THE NAME IS THE ID AND IT SURVIVES). MOD-identifiers decides a requirement's name given
  twice under the same rule (`tests/test_identifiers.py`, its reading).

## Readiness

It waits for a text. A reading that would let it be built was sought first (sprint 123's agreement), and none holds:
- **MOD-test-document** reads one file's text and checks one declaration (MOD-test-document.md, Responsibility and
  Interfaces: "its callers give it the texts of test files"). It sees no other file.
- **MOD-identifiers** "does not know the formats in which identifiers stand" and performs no input or output
  (MOD-identifiers.md, Responsibility). It sees no declaration.
- **MOD-trace-graph** reads every test file through MOD-test-document's `testDeclarations` (MOD-trace-graph.md, Uses) and
  owns "the checks across artifacts, each decided from the graph alone" (`graphFindings`). That makes it the owner.
  - `graphFindings`' accepted text lists its checks, and a repeated test identifier is not among them.
  - A check that the interface does not state would change what the function gives its callers.

The sentence it needs, in MOD-trace-graph's `graphFindings`: a test identifier that more than one declaration holds, as
an error at each declaration, under THE NAME IS THE ID AND IT SURVIVES. That sentence is akmaier's to accept. The item is
ready once an approval record names MOD-trace-graph's text with it.

## Acceptance

- A unit case of `graphFindings` over a fixture graph whose two test files declare the same identifier gives one error at
  each declaration, naming the other.
  - Known positive: the same fixture with distinct identifiers gives none.
  - Counter-proof: with the check left out, the case fails.
- The repository's own tests at the item's head declare no identifier twice. The case reads them as TST-292101 reads the
  gate records, with sprint 127's TST-1187101 to 1187104 as its history's known positive.
- Each test of other modules the change moves is named by the item's planning run before selection.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
