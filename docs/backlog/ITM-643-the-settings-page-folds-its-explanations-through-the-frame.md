---
id: ITM-643
title: The settings page folds its explanations through the frame
level: module
realises:
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-settings-pages
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - ITM-590's gate (docs/gates/20261017-0406-development-release-testing-9d71.md), from developer-sonnet-e's findings on pull request #684
---
# ITM-643 The settings page folds its explanations through the frame

**REGISTER**

## Outcome

`src/settings-pages/settings.mjs:40` builds its own folded explanation, `whatIsThis`, used at :165, :279, :323 and
:386. Every other route uses MOD-site-frame's `explain`. That is two rules for one fold, the defect ITM-588 was
rejected for. The four texts become topics of `src/site-frame/explanations.md`, `whatIsThis` goes, and the tests that
pin its texts are named at the start.

## Acceptance

- Each of the four folds is `explain` of a topic in `explanations.md`, and `whatIsThis` is gone.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
