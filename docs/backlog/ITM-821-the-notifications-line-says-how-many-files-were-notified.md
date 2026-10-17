---
id: ITM-821
title: The notifications line says how many files were notified
level: unit
realises:
  - UC-047
modules:
  - MOD-settings-pages
builds_on:
tests:
  - unit
origin:
  - ITM-810's pull request #761 (sprint team1/75), from developer-sonnet-d's finding
---
# ITM-821 The notifications line says how many files were notified

**REGISTER**

## Outcome

`docs/architecture/MOD-settings-pages.md:135-137` reads: *Notifications* of this browser's section shows the state
`notificationState` gives, "*on*, with how many files were notified, *Test* and *Switch off*". The live line in
`src/settings-pages/settings.mjs` shows *on* without the count.

The line shows the count from `notificationState`, which is in MOD-settings-pages' Uses. If that state gives no count,
the item stops for a draft of MOD-notifications.

## Acceptance

- While notifications are on, the line names how many files were notified, and a test pins it, with its counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
