---
id: ITM-668
title: The specification view leads to Gaps
level: module
realises:
  - UC-020
modules:
  - MOD-trace-pages
builds_on:
  - ITM-599
tests:
  - unit
origin:
  - ITM-599's gate on pull request #708 (docs/gates/20261017-0836-development-release-testing-e7a1.md), from developer-sonnet-d's finding
---
# ITM-668 The specification view leads to Gaps

**REGISTER**

## Outcome

UC-020 step 7: "The tab **Gaps** shows… the traceability matrix". ITM-599 builds the gaps view at `trace` with
`key=gaps`, and nothing on the specification view leads to it. The view gains the way to Gaps at the version shown.
Whether it is a tab of the view or a link, against MOD-trace-pages' and MOD-site-frame's files, is read at the start.

## Acceptance

- The specification view offers Gaps at the version it shows, and choosing it draws the gaps view at that version.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
