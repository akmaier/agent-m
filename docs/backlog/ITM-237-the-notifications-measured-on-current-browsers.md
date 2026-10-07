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

A dated measurement in `docs/measurements/` of what UC-047 relies on, on the instance's Pages site, which serves `main`
and whose dashboard calls MOD-notifications since sprint 07 was merged: the worker registered from `src/notifications/`,
a notification shown through that registration, and a click on it opening its address — measured by a Developer in
current Chrome, Firefox and Safari on a computer. The iPhone's row (UC-047 1b, 3a) is akmaier's measurement of
2026-10-07 on that site, which the file quotes as he gave it: "I was able to test notifications and it did work on
iphone." He stated no version of iOS or of the browser.

## Acceptance

- The file names the date, each browser of the computer with its version, what was done and what was seen, for each of
  the three behaviours.
- It quotes akmaier's measurement as the iPhone's row, with its date and the site it was made on, and says that it names
  no version.
- Only `docs/measurements/` changes.
