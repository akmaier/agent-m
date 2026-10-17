---
id: ITM-645
title: UC-047's release test finds the Notifications fold by what it is
level: system
realises:
  - UC-047
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-notifications
builds_on:
tests:
  - release
origin:
  - ITM-643's gate on pull request #688 (docs/gates/20261017-0502-development-release-testing-b4e1.md)
---
# ITM-645 UC-047's release test finds the Notifications fold by what it is

**REGISTER**

## Outcome

`tests/release-sprint-07-uc-047-notifications.test.mjs:312` finds the Notifications fold by the class
`settings-what-is-this`. That class belongs to the settings page's own fold, which ITM-643 replaces with MOD-site-frame's
`explain`.

ITM-643 may not change this test:
- its header names MOD-notifications, which is none of ITM-643's modules (`AN IMPLEMENTATION JOB CHANGES ONLY ITS
  MODULES`);
- ITM-643's implementer would then write a release test of the behaviour it implements (`RELEASE TESTS ARE NOT WRITTEN
  BY THE IMPLEMENTER`).

So a participant other than ITM-643's implementer, developer-sonnet-e, changes the locator here. The test finds the
fold as what it is: the `<details>` directly in the Notifications control whose `<summary>` reads *What is this?*. It
then finds the same fold on the base and on ITM-643's head.

Its expected results are unchanged.

## Acceptance

- The test passes on `sprint/team1/65` as it stands and on ITM-643's head, with no expected result changed.
- Its counter-proof is a Notifications control without the fold, and it fails.
- It is written by a participant other than developer-sonnet-e.
