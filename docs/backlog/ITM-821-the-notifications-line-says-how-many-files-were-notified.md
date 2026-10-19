---
id: ITM-821
title: The notifications line says how many files were notified
level: unit
realises:
  - UC-047
modules:
  - MOD-settings-pages
  - MOD-notifications
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

**Stopped (sprint team1/76, 2026-10-17, po-opus): it waits for a draft of MOD-notifications.** `NotificationState` is `{ on,
permission, available }`, with no count (`src/notifications/permission.mjs:61-67`). The stored `notified` key holds every
file that waits, which is not the files notified, so counting it would be a reading the text does not make. The draft for
akmaier settles what the count counts and how `notificationState` gives it.

The other states of `MOD-settings-pages.md:135-137` are compared with the live strings at this item's next start.

**The draft for akmaier is on `main`** (sprint team1/92, written by developer-sonnet-c). MOD-notifications' `NotificationState`
gains `notified: number`, and `notificationState` counts it from the key `notified`.
- **A choice for akmaier:** the count is the files that wait for acceptance and were notified or, at the first check, taken
  as known (`src/notifications/checks.mjs:72-104`). It is not the notifications actually shown since *Switch on*. That
  would need a stored counter in MOD-browser-store's `notifications` key and a rule for a file notified again, and it is
  not drafted.
- The item now also changes MOD-notifications, and it waits for that acceptance.

