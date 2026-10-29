---
id: ITM-1304
title: A declaration's value stands on its one line
level: module
realises:
  - A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
modules:
  - MOD-test-document
builds_on: []
tests:
  - unit
origin:
  - developer-opus-f's report on ITM-654 (PR #1414), and po-opus-c's gate, docs/gates/20261029-0727-development-release-testing-77cd.md
---
# ITM-1304 A declaration's value stands on its one line

**REGISTER**

## Outcome

MOD-test-document states a declaration as lines of `key: value`: "each following line is `key: value`"
(MOD-test-document.md:45), and a declaration "ends at the first line that is not a comment line of this form" (:68).
The reader follows that.

Over `tests/` at `2b1caa22`, though, 417 key lines in 147 test files continue their value onto the next comment line, 407
of them `expect:`. The reader cuts each such value at its first line, with no finding, so what a test states as its
expected result is partly unread. ITM-654's comparison of old and new expectations sees only the first line of such a
value.

The texts give one form. The first task names every declaration whose value is continued, from the reader and the
files, with the count above as its known positive.

## Acceptance

- Every declaration under `tests/` holds each value on its one line. The reader, run over `tests/`, reads every value
  whole: no key line is followed by a continuation of its value.
- No expected result of a test changes, and CI is green on every commit (refactoring).
- Only the test files whose declarations are continued change. The pull request names each file and its module, since
  they lie in many modules.
- A continued value that cannot stand on one line, for its length, is named in the pull request. Letting a value continue
  would be a change of MOD-test-document's text, for akmaier.
