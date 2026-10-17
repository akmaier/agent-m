---
id: ITM-660
title: A module's header states what holds
level: module
realises:
  - A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES
modules:
  - MOD-source-register
builds_on:
tests:
  - unit
origin:
  - ITM-637's gate on pull request #701 (docs/gates/20261017-0708-development-release-testing-1d6a.md), from developer-sonnet-e's finding
---
# ITM-660 A module's header states what holds

**REGISTER**

## Outcome

`src/source-register/index.mjs:1-10` tells which item added which function ("ITM-217 builds …", "ITM-589 adds
affectedRequirements …"). It ends with a sentence that is no longer true: "Fetching a source's content, a new version
and the module's other functions are not built yet." `readContent` and `versionCommits` are built.

AGENTS.md §1 reads: "History belongs in git commit messages and version history, not in the files themselves. Files
state what holds now." So the header states the module's interface as it holds, and names no item.

The same kind of header stands in other modules' `index.mjs`: 61 item identifiers are found in `src/*/index.mjs` on
`sprint/team1/67`. Each of them is for the item that next changes that module, and it is not a change of this one
(one module per item).

## Acceptance

- `src/source-register/index.mjs`'s header names what the module gives and what it does not give yet, and no item.
- No expected result of a test changes. It is declared as refactoring.

**Folded into ITM-576 at sprint team1/68's start**, by sprint 67's agreement: "An item whose code touches a module header
removes the item history in it." ITM-576 changes `src/source-register/index.mjs`, so its header is ITM-576's to correct.
This item is done with it.
