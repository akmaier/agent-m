---
id: ITM-238
title: The system and release tests of UC-047
level: system
realises:
  - UC-047
modules:
  - MOD-notifications
  - MOD-progress-measures
builds_on:
  - ITM-236
tests:
  - system
  - release
origin:
  - UC-047
---
# ITM-238 The system and release tests of UC-047

**REGISTER**

## Outcome

The system and release tests of UC-047, written by a Developer who implemented none of it (`RELEASE TESTS ARE NOT
WRITTEN BY THE IMPLEMENTER`), through the dashboard's settings page and pages once they call MOD-notifications.

## Acceptance

- Every requirement UC-047 realises has a release test; each new test's counter-proof is recorded in the pull request.
- Where the page and UC-047 disagree, the test follows UC-047 and the disagreement is named as a finding.
- Only tests change.
