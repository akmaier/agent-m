---
id: ITM-1056
title: The release tests of the Bridge's release, its updates and its window's settings
level: release
realises:
  - UC-044
  - THE BRIDGE IS ONE FILE PER PLATFORM
  - THE BRIDGE IS SIGNED BY ITS PUBLISHER
  - THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE
  - THE BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT
modules:
  - MOD-bridge-build
  - MOD-desktop-shell
builds_on:
  - ITM-1049
  - ITM-1053
  - ITM-1054
tests:
  - release
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-044-15, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1056 The release tests of the Bridge's release, its updates and its window's settings

**REGISTER**

## Outcome

SPEC.md names `tests/test_bridge_release.py` for `THE BRIDGE IS ONE FILE PER PLATFORM` ("the release build yields one file per
platform, and each starts, after installation where it is an installer, on a machine without Node or Deno"), `THE BRIDGE IS
SIGNED BY ITS PUBLISHER` and `THE BRIDGE IS UPDATED ONLY BY THE PERSON'S CHOICE`, and `tests/test_bridge_settings.py` for `THE
BRIDGE IS CONFIGURED IN ITS WINDOW OR FROM AN EXPORT`. Neither file exists. They are written by a participant who implements
none of the items they test (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- Both files exist and guard their requirements as SPEC.md states the checks; each new test's counter-proof is recorded in the
  pull request.
- Where the Bridge and UC-044 disagree, the test follows UC-044 and the disagreement is named as a finding.
- Only tests change.
