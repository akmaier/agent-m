---
id: ITM-581
title: A product's issues are listed, commented, labelled and closed through its host
level: module
realises:
  - UC-012
modules:
  - MOD-repository-hosts
builds_on:
tests:
  - unit
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-581 A product's issues are listed, commented, labelled and closed through its host

**REGISTER**

## Outcome

UC-012 steps 2, 4 and 4a: "opens it in Agent M"; "closed with the reason". MOD-repository-hosts provides `listIssues`, `commentOnIssue`, `setIssueLabels` and `setIssueState`. None of them is built.

## Acceptance

- Each of the four functions works against a fixture GitHub and a fixture GitLab, and names its failures.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
