---
id: ITM-593
title: A requirement edit refused for missing write access offers GitHub's route
level: module
realises:
  - UC-018
modules:
  - MOD-review-pages
builds_on:
tests:
  - unit
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-593 A requirement edit refused for missing write access offers GitHub's route

**REGISTER**

## Outcome

UC-018 6b for a requirement: "the dashboard offers the GitHub route". `src/review-pages/edit.mjs:108-110` shows only the error's name and message. The use-case path offers the route (`file-edit.mjs:106`).

## Acceptance

- `PermissionMissing` on a requirement edit offers the GitHub route, as it does for a use case.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
