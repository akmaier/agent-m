---
id: ITM-1127
title: The settings page's context names each setting and whether it is stored
level: module
realises:
  - UC-049
  - A STORED SECRET IS HIDDEN UNTIL SHOWN
modules:
  - MOD-settings-pages
builds_on:
tests:
  - unit
origin:
  - developer-sonnet-i's release tests of UC-049 (ITM-513, pull request #1162, head 3d20fdc1)
---
# ITM-1127 The settings page's context names each setting and whether it is stored

**REGISTER**

## Outcome

UC-049 3c: "The context names the settings and whether each is stored; it never carries a stored" secret. The settings
page's context for the prompt bar is the text it has drawn, which does not say, per setting, whether it is stored. Its
`subject` (MOD-site-frame's `Route.subject`) names each setting and whether it is stored, and carries no stored value.

## Acceptance

- TST-513023 passes and its `todo` is removed. TST-513022, which asserts that no stored token, key or password is
  carried, stays green.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
