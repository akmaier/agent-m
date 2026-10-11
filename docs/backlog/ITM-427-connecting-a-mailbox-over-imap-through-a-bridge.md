---
id: ITM-427
title: Connecting a mailbox over IMAP through a Bridge
level: module
realises:
  - UC-037
  - THE MAILBOX PASSWORD IS STORED ONLY AFTER ITS OWN DISCLOSURE
  - A MAILBOX THROUGH THE JUMP HOST IS NAMED AS READABLE THERE
  - THE SHARED PAGES ORIGIN IS DISCLOSED
  - THE PLACES A MAILBOX'S MAIL MAY GO ARE CONFIGURED
  - A PLACE OUTSIDE THE EU IS NAMED AS NOT COMPLIANT
  - ONE CLICK PER DECISION
  - EVERY STEP EXPLAINS ITSELF
  - CONFIGURATION IS STORED IN LOCALSTORAGE, NOT IN A COOKIE
modules:
  - MOD-settings-pages
builds_on:
  - ITM-403
  - ITM-404
  - ITM-422
  - ITM-425
  - ITM-426
tests:
  - unit
origin:
  - UC-037 steps 1 and 4 to 8, 4a, 4b, 7a to 7d
---
# ITM-427 Connecting a mailbox over IMAP through a Bridge

**REGISTER**

## Outcome

MOD-settings-pages' route `mailbox`, in its part `mailbox.mjs`, for the IMAP route, as its file states it: *Connect a
mailbox* and the address, the route preselected by `routeFor` and changeable (ITM-423); the IMAP and SMTP servers with
their ports, the usual encryption preset for each port and the account preset to the address; the password's notice —
the shared Pages origin, what the password grants, that it goes only to the Bridge the connection names, the recommended
owner — before the password field is enabled; the Bridge, chosen among the Bridges this browser keeps (ITM-403), this
computer's preset where there is one, and, for one reached through the jump host, the notice that the jump host can read
the password and the mails, ticked before saving; the folders, `INBOX` preset; the processing places the participants
declare, none preset, a place outside the EU stated as not compliant before saving; *Store and test*, one click: the
connection stored (ITM-422) and tested through the chosen Bridge (ITM-425, ITM-404), each part shown with its counts,
route and encryption, or with its failure — the Bridge not answering, a server without encryption, a refused login with
the app password explained, reading without sending —; the connected mailbox with its route. Each step's explanation is
folded (ITM-426). The Microsoft route is ITM-428's; *Disconnect* and the places changed later are ITM-429's.

## Acceptance

- Unit tests that name MOD-settings-pages state, before the code exists, in the small DOM of
  `tests/site-frame.test.mjs`, with fake Bridges and a fake mailbox: the password field disabled until the notice is
  ticked, and nothing stored before; the Bridges this browser keeps offered, this computer's preset; a Bridge reached
  through the jump host stored only after its notice is ticked; a place outside the EU stored only after its notice; one
  click storing the connection and testing it, each part shown; each failure of UC-037 7a to 7d shown as named; no
  cookie and nothing in the address.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/settings-pages/` and the tests that name MOD-settings-pages change.
