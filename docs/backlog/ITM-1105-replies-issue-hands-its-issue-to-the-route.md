---
id: ITM-1105
title: The live dashboard hands #replies/<issue>'s issue to the route
level: unit
realises:
  - UC-039
modules:
  - MOD-site-frame
builds_on:
  - ITM-1103
tests:
  - unit
origin:
  - the gate of #1137 (ITM-1103), sprint team2/97, on main at 09ac9ba2
---
# ITM-1105 The live dashboard hands #replies/<issue>'s issue to the route

**REGISTER**

## Outcome

ITM-1103 dispatches `#replies` with the address's parameters, and the route `replies/<issue>` takes its issue from them
(MOD-maintenance-pages.md:117). #1137 names that not handing them fails no test.

## Acceptance

- A unit test naming MOD-site-frame: `#replies/12` renders the route with the issue `12`. Counter-proof: the dispatch without
  the parameters fails it.
- The code is built, so the red evidence is that planted fault.
- Only tests that name MOD-site-frame change.
