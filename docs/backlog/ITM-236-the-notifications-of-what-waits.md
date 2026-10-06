---
id: ITM-236
title: The notifications of what waits
level: module
realises:
  - UC-047
  - A PERSON IS TOLD WHAT WAITS FOR THEIR ACCEPTANCE
  - NOTIFICATIONS ARE SWITCHED ON BY THE PERSON
modules:
  - MOD-notifications
builds_on:
  - ITM-204
  - ITM-235
tests:
  - unit
origin:
  - UC-047
---
# ITM-236 The notifications of what waits

**REGISTER**

## Outcome

MOD-notifications, as its file states it, in `src/notifications/`: `NotificationState`, `notificationState`, `switchOn`,
`testNotification`, `switchOff`, `watchForAcceptance` and the service worker `worker.mjs`. Making the dashboard's settings
page show the line *Notifications* and its pages start the checks is a change between jobs after this item.

## Acceptance

- Unit tests that name MOD-notifications state, before the code exists, with the browser's notification, worker and timer
  replaced by fakes:
  - *Switch on* asks the permission only on the call, and a refusal stores nothing;
  - the first check after *Switch on* notifies nothing;
  - a file come to wait is notified once, with its text and address, and a file changed again anew;
  - more than three of one kind in one repository give one notification of their number;
  - a repository that cannot be read is skipped until the next check;
  - *Switch off* removes both keys.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/notifications/` and the tests that name MOD-notifications change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
