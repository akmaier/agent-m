---
id: ITM-1144
title: A resource kind's required columns are stated once
level: module
realises:
  - A DATA FORMAT IS DEFINED ONCE
modules:
  - MOD-resource-list
builds_on:
  - ITM-1130
tests:
  - unit
origin:
  - developer-sonnet-f's tests/test_resources.py (ITM-1130, pull request #1174), and po-opus-b's planted fault at its gate
---
# ITM-1144 A resource kind's required columns are stated once

**REGISTER**

## Outcome

f's pull request #1174 names it: "The schema and `rules.mjs` state several requirements twice (a kind's required
columns). A fault in one of the two alone is not a fault." At the gate, the check of each kind's required columns,
switched off in `src/resource-list/rules.mjs:44-49` (`NEEDS`), failed no test, because the schema still refuses the same
entries. Two statements of one rule drift apart (AGENTS.md §2, principle 2). First read which place MOD-resource-list's
text gives the rule. The other copy goes.

## Acceptance

- Each kind's required columns are stated in one place. tests/test_resources.py stays green, and a fault planted in that
  one place fails it.
- It is declared as refactoring: no expected result changes, and CI is green on every commit.
