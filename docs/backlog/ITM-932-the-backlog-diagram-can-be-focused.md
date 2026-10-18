---
id: ITM-932
title: The backlog's diagram that scrolls can be focused
level: module
realises:
  - THE SITE SERVES A SCREEN READER
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-681
  - ITM-905
tests:
  - unit
origin:
  - developer-sonnet-d's measurement on ITM-921's pull request #899 (sprint team1/90)
---
# ITM-932 The backlog's diagram that scrolls can be focused

**REGISTER**

## Outcome

ITM-905's check finds `scrollable-region-focusable` on `#backlog` at a phone's width, on a `.mermaid` element. `#backlog`
is still drawn by the old view `docs/assets/dashboard/backlog-view.mjs`. MOD-implementation-pages.md:117 names it as taken
over, removed once this module's route `backlog` is live (ITM-681). So the fix is in that route. Measured by
developer-sonnet-d on #899.

## Acceptance

- The module's route `backlog` draws no region that scrolls and cannot be focused. The todo for `#backlog` is removed.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
