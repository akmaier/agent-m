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

**Settled at sprint team1/66's start. Selectable, as a refactoring.**
- **The module whose files it changes:** MOD-site-frame alone. New `src/site-frame/notices.mjs` and `decision.mjs`, and
  `index.mjs`, which keeps exporting `notice` and `confirmDecision` and uses `notice` itself (`index.mjs:258, 260`).
- **The grep, full output read:** `grep -rn "notices.mjs\|decision.mjs\|confirmDecision\|notice(" src/site-frame/*.mjs`
  finds:
  - the header line `index.mjs:4`;
  - the two uses at :258 and :260;
  - the definitions at :353-355 and :369-371.

  `notice` and `confirmDecision` are imported only through `index.mjs`, since the two files do not exist yet. Other
  files of the module are imported directly elsewhere, and they stay as they are: `routing.mjs` 4 times, `run-panel.mjs`
  twice, `subject.mjs` twice, `start.mjs` 12 times (`grep -rhoE "site-frame/[a-z-]+\\.mjs" src tests`). So no import
  outside the module changes.
- **`A REFACTORING JOB BEGINS WITHOUT A FAILING TEST` and `A REFACTORING JOB CHANGES NO EXPECTED RESULT`:** CI is green
  on every commit, and no test's expected result changes.
- **Measurement:** none is claimed.

## Acceptance

- `notice` and `confirmDecision` are defined in `notices.mjs` and `decision.mjs`, and `index.mjs` re-exports them.
- No test changes its expected result, and CI is green on every commit.
- The job is declared as refactoring.
