---
id: ITM-1210
title: CI checks the Definition of Done of a pull request (onDoneCheck)
level: module
realises:
  - A PULL REQUEST IS MERGED ONLY WHEN THE DEFINITION OF DONE HOLDS
  - THE DEFAULT DEFINITION OF DONE IS THE JOB RULES
  - UC-027
modules:
  - MOD-workflow-entries
builds_on:
  - ITM-409
  - ITM-744
tests:
  - unit
origin:
  - ITM-476, split on akmaier's request of 2026-10-25 to get the test pages working; the analysis of ITM-476 against main at cd6b00ff
---
# ITM-1210 CI checks the Definition of Done of a pull request (onDoneCheck)

**REGISTER**

## Outcome

MOD-workflow-entries' entry `onDoneCheck` (MOD-workflow-entries.md, Interfaces), which the generated test configuration's
Definition-of-Done job already calls (`src/test-schedule/templates/github-done.yml:13`). Today
`src/workflow-entries/main.mjs` names no such entry.

On a pull request opened or updated, it runs MOD-product-process' Definition-of-Done check (ITM-409) on the pull request's
facts from MOD-repository-hosts and the product's declared conditions, and shows its status and findings on the pull
request. The interfaces it uses are used unchanged.

## Acceptance

- Unit tests naming MOD-workflow-entries, over a fake host: a pull request meeting every condition ends `passed`; one
  missing a condition ends `failed` and names it on the pull request; a missing secret ends the entry before anything is
  written.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/workflow-entries/` and the tests that name MOD-workflow-entries change; the code stays in the files
  MOD-workflow-entries' Parts name.
