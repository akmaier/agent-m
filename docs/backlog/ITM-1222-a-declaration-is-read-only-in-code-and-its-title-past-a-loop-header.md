---
id: ITM-1222
title: A declaration is read only in code, and its title past a loop header and escaped quotes
level: module
realises:
  - EVERY TEST RUN LEAVES A RESULT RECORD
  - UC-028
modules:
  - MOD-test-document
builds_on:
  - ITM-1220
tests:
  - unit
origin:
  - the record of Agent M's generated CI on 2d253004 (run 40290040279): about 35 declared tests whose title testDeclarations reads null or wrong, and a fixture read as a declaration
---
# ITM-1222 A declaration is read only in code, and its title past a loop header and escaped quotes

**REGISTER**

## Outcome

MOD-test-document's `testDeclarations` (`src/test-document/declarations.mjs`) still misreads these, by MOD-test-document's
Data — a declaration is a block of comment lines, in the comment marker of the file's language, directly before a test
case, whose title is that case's name:

- comment-shaped lines inside a string literal are read as a declaration: the fixture in
  `tests/job-runner-check-fixes.test.mjs:195–200`, inside a template string, yields TST-584001 with the title `${id}`;
- a title with an escaped quote is cut at it (`STRING_LITERAL`, `:20`): TST-472351, TST-843006, TST-537001;
- a declaration before a loop whose body is the test reads the loop header: `null` for TST-748001…005
  (`tests/repository-hosts-merge-pull-request.test.mjs:77`), `"stored facts"` for TST-1149003;
- the first literal inside a template is taken (TST-478028), and a leading space is kept (TST-604003).

## Acceptance

- Unit tests naming MOD-test-document over fixtures of each shape: no declaration from a string literal; the full title
  with an escaped quote; the title past a `for (…)` header; the whole template title; no leading space. Counter-proof:
  before the change each is wrong.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/test-document/` and the tests that name MOD-test-document change.
