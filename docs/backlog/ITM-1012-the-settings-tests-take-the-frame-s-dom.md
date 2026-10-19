---
id: ITM-1012
title: The settings tests take the frame's DOM from its helper
level: unit
realises:
  - A TEST STATES ITS EXPECTED RESULT BEFORE IT RUNS
modules:
  - MOD-settings-pages
builds_on:
  - ITM-670
tests:
  - unit
origin:
  - ITM-670's pull request #942 (sprint team1/92), from developer-sonnet-a's finding
---
# ITM-1012 The settings tests take the frame's DOM from its helper

**REGISTER**

## Outcome

`tests/settings-pages-harness.mjs` holds a fixture DOM of its own beside the frame's helper `tests/site-frame-dom.mjs`. They
differ: the harness reads a non-breaking space as a plain space, and makes a fresh document per call
(`installDocument()`, used by about 30 files).

**First task:** read which of the two behaviours the settings tests expect. The helper gains a fresh-document factory, and
the harness's copy goes (nothing twice).

## Acceptance

- `tests/settings-pages-harness.mjs` holds no DOM of its own, and every settings test passes with no expected result
  changed. It is declared as refactoring: CI is green on every commit.
