---
id: ITM-582
title: An issue is analysed and its class confirmed, corrected or the issue rejected in one click
level: module
realises:
  - UC-012
modules:
  - MOD-issue-handling
  - MOD-maintenance-pages
  - MOD-job-catalogue
builds_on:
  - ITM-581
tests:
  - unit
  - component
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-582 An issue is analysed and its class confirmed, corrected or the issue rejected in one click

**REGISTER**

## Outcome

UC-012 steps 2 to 4, 3a and 4a. What exists and what does not:
- The kind `analyse-issue` exists, but its recipe `issue-context` is not registered (`tests/job-runner-prepare.test.mjs:206-211`).
- `confirmClass` is not built, and neither are the routes `issues` and `issue/<number>`.
- MOD-issue-handling's `IssueClass` says "a missing requirement is a change". The kind's prompt is made to say so.

## Acceptance

- *Analyse* runs with its run panel and proposes a class with its reasoning.
- One click confirms the class, corrects it or rejects the issue.
- A rejected issue is closed with the reason.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
