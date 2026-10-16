---
id: ITM-605
title: The prompt bar hands routeStrategies
level: module
realises:
  - UC-049
  - UC-024
modules:
  - MOD-prompt-bar
builds_on:
  - ITM-567
  - ITM-572
tests:
  - unit
origin:
  - sprint team1/54's start: `implement` names the writer `branch-and-pull-request`, which `prepareJob` checks (`src/job-runner/prepare.mjs:25-31`), so its hand-over prepares in the tab only once `handOverStrategies` holds `routeStrategies`
---
# ITM-605 The prompt bar hands routeStrategies

**REGISTER**

## Outcome

MOD-prompt-bar's `handOverStrategies` gains MOD-runtimes' `routeStrategies`, once ITM-567 builds it. Its file already
names that set among the thirteen.

## Acceptance

- On the main page and on the review pages, a hand-over of `implement` is prepared without `UnknownStrategy`.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
