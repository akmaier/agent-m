---
id: ITM-237
title: The notifications measured on current browsers
level: system
realises:
  - UC-047
  - BROWSER REACHABILITY IS MEASURED, NOT ASSUMED
modules:
  - MOD-notifications
builds_on:
  - ITM-236
tests:
  - system
origin:
  - UC-047
---
# ITM-237 The notifications measured on current browsers

**REGISTER**

## Outcome

A dated measurement in `docs/measurements/` of what UC-047 relies on, on the instance's Pages site once the dashboard
calls MOD-notifications: the worker registered from `src/notifications/`, a notification shown through that
registration, and a click on it opening its address — in current Chrome, Firefox and Safari on a computer, and in Safari
on an iPhone from the Home Screen (UC-047 1b, 3a). The iPhone's row is measured by akmaier on his own device, by the
steps the file gives.

## Acceptance

- The file names the date, each browser with its version, what was done and what was seen, for each of the three
  behaviours.
- Only `docs/measurements/` changes.
