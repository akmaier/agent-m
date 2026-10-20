---
id: ITM-1169
title: Every test declaration states each field on one line
level: module
realises:
  - A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
modules:
  - MOD-test-document
builds_on:
  - ITM-649
tests:
  - unit
origin:
  - ITM-649's pull request #1261 (sprint team1/102), from developer-sonnet-b's finding
---
# ITM-1169 Every test declaration states each field on one line

**REGISTER**

## Outcome

MOD-test-document's Data: after the identifier, "each following line is `key: value`", and "a declaration ends at the
first line that is not a comment line of this form". `testDeclarations` reads it so
(`src/test-document/declarations.mjs:96-101`).

Many headers wrap a field over further comment lines. Such a declaration ends at the first wrapped line, and the fields
after it are lost.
- On `1c206bbe`, 78 of the 4838 declarations in `tests/` are read with `given`, `input` or `expect` missing, in 44 files.
- One is TST-1041015 in `tests/system-uc-040-declare-the-products-resources.test.mjs`: its `input` and `expect` are
  written, but read as `null`.

The reader follows the text, so the headers are what changes. Each field of a declaration stands on one line. A
declaration whose field is really missing gets it written.

## Acceptance

- `testDeclarations` over `tests/` reads every declaration with its `given`, `input` and `expect`. A test asserts this,
  and its counter-proof is a wrapped field, which is read as missing.
- The headers of release tests are rewritten by a participant who built none of the behaviour they test, in a commit of
  its own.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
