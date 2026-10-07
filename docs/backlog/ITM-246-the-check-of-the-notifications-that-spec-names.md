---
id: ITM-246
title: The check of the notifications that SPEC.md names
level: system
realises:
  - UC-047
  - A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE
  - NOTIFICATIONS ARE SWITCHED ON BY THE PERSON
modules:
  - MOD-notifications
builds_on:
  - ITM-236
tests:
  - release
origin:
  - UC-047
---
# ITM-246 The check of the notifications that SPEC.md names

**REGISTER**

## Outcome

`tests/dashboard-notifications.test.mjs`, which `SPEC.md` names as the check of `A PERSON IS TOLD WHAT WAITS FOR THEIR
ACCEPTANCE` and of `NOTIFICATIONS ARE SWITCHED ON BY THE PERSON` and which does not exist: release tests of the two
requirements with the cases their checks state, through the dashboard's pages as they reach MOD-notifications since the
change between jobs #157, reached the way ITM-238's tests reach them. They are written by a Developer who implemented
none of UC-047 (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`). With the file, the check of both requirements is the
one `SPEC.md` names, and `SPEC.md` needs no change.

## Acceptance

- The file states, for `A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE`: between two checks of a fixture instance, a
  newly open use case and a newly open SPEC change yield one notification each, naming the file and linking the page
  where it is accepted; and a file already notified, or notifications switched off, yields none.
- It states, for `NOTIFICATIONS ARE SWITCHED ON BY THE PERSON`: no page of the dashboard asks for the permission before
  the click that switches them on, and that click asks once.
- Each test names the requirement it guards and the module it exercises; its counter-proof — a fault planted in the code
  it guards, and the test failing on it — is recorded in the pull request.
- Where the pages and a requirement disagree, the test follows the requirement and the disagreement is named as a
  finding.
- Only `tests/dashboard-notifications.test.mjs` is added; nothing else changes.
