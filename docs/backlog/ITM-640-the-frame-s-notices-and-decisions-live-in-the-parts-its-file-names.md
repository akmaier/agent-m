---
id: ITM-640
title: The frame's notices and decisions live in the parts its file names
level: module
realises:
  - A MODULE STATES ITS RESPONSIBILITY AND ITS INTERFACES
modules:
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - ITM-590's gate (docs/gates/20261017-0406-development-release-testing-9d71.md), from developer-sonnet-e's findings on pull request #684
---
# ITM-640 The frame's notices and decisions live in the parts its file names

**REGISTER**

## Outcome

MOD-site-frame's Parts name `notices.mjs` and `decision.mjs`, for notices and the dialog of a decision. Neither file
exists: `notice` and `confirmDecision` are written in `src/site-frame/index.mjs`. This is a refactoring. The code moves
to the files the module's file names, `index.mjs` exports them as before, and no expected result changes
(`A REFACTORING JOB CHANGES NO EXPECTED RESULT`).

## Acceptance

- `notice` and `confirmDecision` are defined in `notices.mjs` and `decision.mjs`, and `index.mjs` re-exports them.
- No test changes its expected result, and CI is green on every commit.
- The job is declared as refactoring.
