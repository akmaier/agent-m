---
id: ITM-931
title: The editor's preview that scrolls can be focused
level: module
realises:
  - THE SITE SERVES A SCREEN READER
modules:
  - MOD-markdown-render
builds_on:
  - ITM-905
tests:
  - unit
origin:
  - developer-sonnet-d's measurement on ITM-921's pull request #899 (sprint team1/90)
---
# ITM-931 The editor's preview that scrolls can be focused

**REGISTER**

## Outcome

ITM-905's check finds `scrollable-region-focusable` on the three edit pages. The box that scrolls is the editor's `.preview`,
which MOD-markdown-render's editor draws (`src/markdown-render/editor.mjs:30`). It cannot be reached by keyboard. Measured
by developer-sonnet-d on #899.

## Acceptance

- The editor's preview can be focused. The check's `scrollable-region-focusable` todos for the edit pages are removed, and
  the check passes there, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
