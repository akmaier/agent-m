---
id: ITM-1220
title: A declaration's title is read past every comment line of its block
level: module
realises:
  - EVERY TEST RUN LEAVES A RESULT RECORD
  - UC-028
modules:
  - MOD-test-document
builds_on:
  - ITM-1211
tests:
  - unit
origin:
  - the first record of Agent M's generated CI (PR #1341, run 40287501150): about 380 declared tests whose title testDeclarations reads null or wrong
---
# ITM-1220 A declaration's title is read past every comment line of its block

**REGISTER**

## Outcome

MOD-test-document's `testDeclarations` gives a declaration's `title` as the test case's name on the first line after the
declaration's comment block. For about 380 of Agent M's declarations it gives `null` or a wrong text, so that no command
can name their cases by it:

- 226 node declarations whose block holds a comment line after its fields that is not a `key: value` field, e.g.
  TST-961007, whose block ends with a `// Planted fault:` line before `test(`, read `null`;
- 137 node declarations read a wrong title (e.g. "Malformed OpenSSH private key", "s place (MOD-site-frame");
- 15 Python declarations whose field continues over `#         …` lines, e.g. TST-519011, read `null` or wrong.

The title is the name of the test case the block stands before, read past every comment line of the block, in each
language MOD-test-document names.

## Acceptance

- Unit tests naming MOD-test-document over fixtures shaped as TST-961007, TST-519011 and one of the misread titles: each
  title is the case's name. Counter-proof: before the change each is `null` or wrong.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-document/` and the tests that name MOD-test-document change.
