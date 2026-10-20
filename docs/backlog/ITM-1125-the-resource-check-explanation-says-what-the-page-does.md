---
id: ITM-1125
title: The explanation resource-check says what the page does through a Bridge
level: module
realises:
  - UC-040
modules:
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - developer-sonnet-f's release tests of UC-040 (ITM-1041, pull request #1164, head aec01f83)
---
# ITM-1125 The explanation resource-check says what the page does through a Bridge

**REGISTER**

## Outcome

TST-1041020: the explanation `resource-check` in `src/site-frame/explanations.md` says that a check through a Bridge is
one "this page does not make yet". The page makes it (ITM-960). The explanation says what the page does.

## Acceptance

- TST-1041020 passes and its `todo` is removed.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
