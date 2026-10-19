---
id: ITM-1083
title: The test pages hand the frame the strategies of propose-tests, sourceStrategies among them
level: module
realises:
  - UC-026
modules:
  - MOD-test-pages
builds_on:
  - ITM-763
tests:
  - unit
origin:
  - the gate of #1082 (ITM-763), sprint team2/96, on main at 2063e5b8
---
# ITM-1083 The test pages hand the frame the strategies of propose-tests, sourceStrategies among them

**REGISTER**

## Outcome

The route `generate` prepares a job of kind `propose-tests` in the tab, and its recipe `chapters-for-tests` is MOD-source-register's
`sourceStrategies`. MOD-test-pages.md:104-105 names the strategies its view hands: `scheduleStrategies`, `resultStrategies`,
`routeStrategies` and `approvalStrategies`. Its Uses do not name `sourceStrategies`. ITM-763's tests register it themselves.
The live page has it only where another view of the same page hands it (MOD-main-page, MOD-review-pages).

## Not ready: it needs a draft

The draft for akmaier adds `MOD-source-register.sourceStrategies` to MOD-test-pages' Uses and to the strategies its `view`
hands. It is one module text, and no pending draft is on that file (`docs/approvals/`, accepted).

## Acceptance

- Written once the draft is accepted: the view hands `sourceStrategies`, and a test that registers only the test pages' view
  prepares a `propose-tests` job.
