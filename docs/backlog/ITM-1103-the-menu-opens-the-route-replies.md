---
id: ITM-1103
title: The live dashboard's menu opens the route replies
level: module
realises:
  - UC-039
modules:
  - MOD-site-frame
builds_on:
  - ITM-1099
  - ITM-966
tests:
  - unit
origin:
  - the gate of #1130 (ITM-966), sprint team2/97, on main at c2b96957
---
# ITM-1103 The live dashboard's menu opens the route replies

**REGISTER**

## Outcome

ITM-966 builds MOD-maintenance-pages' route `replies`. ITM-1099 made the live dashboard load the module's view, and its
menu open `#mail`. The menu does not open `#replies`. This is the same step ITM-1099 took for `mail`.

## Acceptance

- A unit test naming MOD-site-frame: the menu offers `#replies`, and it opens the route. Counter-proof: without it,
  `#replies` is not offered.
- Release tests that pin the menu's routes are changed by a participant other than the implementer, in a commit of its own,
  and run locally.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only MOD-site-frame's files and tests change.
