---
id: ITM-1001
title: jsrun hands node the code on its standard input
level: module
realises:
  - A RELEASE RUNS EVERY TEST AT EVERY LEVEL
modules:
  - MOD-test-document
builds_on: []
tests:
  - unit
origin:
  - team 1's request in docs/backlog/sprints/team1/92.md, "The end gate waits: python (2) of #944"
  - the CI job 117914452015 of #955, python (2), which fails TST-412100 with `OSError: [Errno 7] Argument list too long: 'node'`
---
# ITM-1001 jsrun hands node the code on its standard input

**REGISTER**

## Outcome

`tests/jsrun.py`'s `js` hands node its code as one argument (`node --input-type=module -e <code>`, `:56`).
`repository_findings` in `tests/test_no_history.py` (`:163`) puts the hex of every repository path into that code, about
137,000 bytes. Linux caps one argument at 131,072 bytes (MAX_ARG_STRLEN), so TST-412100 fails there with
`OSError: [Errno 7] Argument list too long: 'node'`, and with it python (2) of every mode=all run. macOS's larger limit
hides it locally. A release cannot run every test while one test cannot start, so the end gates of both teams wait.

This item makes `js` hand node the code on its standard input (`node --input-type=module` with `input=code`). Team 1
measured 300,000 bytes of module code with a top-level `await` run that way. No caller is then bound by an argument limit.

## Acceptance

- `tests/jsrun.py`'s `js` runs node as `node --input-type=module` and gives the code as `input`. Nothing else in the file
  changes, and every caller keeps its interface.
- `tests/test_jsrun_stdin.py` holds TST-1001001 and TST-1001002, declared for MOD-test-document.
  - TST-1001001: `js` of an expression of 300,000 bytes returns its value.
  - TST-1001002, the counter-proof: the same kind of code, longer than `getconf ARG_MAX` and than 131,072 bytes, as the
    argument of `node --input-type=module -e` raises `OSError` with errno E2BIG on Linux and on macOS, and `js` returns
    its value.
- The first commit holds only the test and this item file, and CI is red on it.
- The whole Python suite passes, since every Python test reaches the code of a module through `js`.
