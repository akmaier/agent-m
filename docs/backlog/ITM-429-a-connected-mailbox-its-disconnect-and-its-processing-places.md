---
id: ITM-429
title: A connected mailbox, its Disconnect and its processing places
level: module
realises:
  - UC-037
  - A CLEAR IS A REAL CLEAR
  - A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
  - THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED
  - A PLACE OUTSIDE THE EU IS NAMED AS NOT COMPLIANT
modules:
  - MOD-settings-pages
builds_on:
  - ITM-427
  - ITM-428
tests:
  - unit
origin:
  - UC-037 step 8, 6a, 8a, 1a
---
# ITM-429 A connected mailbox, its Disconnect and its processing places

**REGISTER**

## Outcome

In MOD-settings-pages, the connected mailbox, as its file states it: its line among this browser's settings with its
route, folders and allowed places, *Test* and *Disconnect*; *Disconnect* asking once, then removing the connection —
password or sign-in token included — from `localStorage` (ITM-422) and saying that nothing is stored, with Microsoft's
page for withdrawing the app's access on that route; *Processing places* changed later with the same list and notice; a
connection an import brought shown as connected and untested.

## Acceptance

- Unit tests that name MOD-settings-pages state, before the code exists, in the small DOM: the line with its route,
  folders and places; *Disconnect* asking once and leaving no key of the connection or its sign-in; the withdrawal page
  linked on the Microsoft route; changed places stored, a place outside the EU only after its notice; no request to a
  repository host, so no issue and no mail identifier touched.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/settings-pages/` and the tests that name MOD-settings-pages change.
