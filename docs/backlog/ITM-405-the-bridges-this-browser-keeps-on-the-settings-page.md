---
id: ITM-405
title: The Bridges this browser keeps, on the settings page
level: module
realises:
  - UC-011
  - UC-042
  - UC-044
  - A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
  - THE DASHBOARD WRITES THE TUNNEL COMMANDS
  - A BRIDGE CAN BE REACHED OVER HTTPS THROUGH THE JUMP HOST
modules:
  - MOD-settings-pages
builds_on:
  - ITM-403
  - ITM-404
  - ITM-280
  - ITM-287
tests:
  - unit
origin:
  - UC-042 step 2, 2a
  - UC-044 step 4, 4d, 6a step 5
  - UC-011 1c, 1d
---
# ITM-405 The Bridges this browser keeps, on the settings page

**REGISTER**

## Outcome

In MOD-settings-pages' route `bridge` and the settings page's lines, as its file states them: each Bridge this browser
keeps as a line of its own under its name, with *Test* at its address — for one reached through the jump host its HTTPS
address, a certificate the browser does not trust named as a possible cause —, *Change* and *Clear*, which names first
the endpoints, participants, mailbox and resources that name it; pairing a Bridge on this computer or at a forwarded
address under the name it reports; *+ Bridge through the jump host*, named by the person, with its port from the range
and the two tunnel commands; the jump host's line with its own *Test*; the web server's configuration for every Bridge
reached through it.

## Acceptance

- Unit tests that name MOD-settings-pages state, before the code exists, with the Bridge client replaced: two Bridges
  listed and tested by name; a jump-host Bridge tested at its HTTPS path; *Clear* naming the endpoint that names it
  first; pairing storing the reported name; a new jump-host Bridge with the lowest free port and its commands; the jump
  host's *Test*.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/settings-pages/` and the tests that name MOD-settings-pages change.
