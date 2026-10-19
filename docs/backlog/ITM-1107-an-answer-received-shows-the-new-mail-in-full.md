---
id: ITM-1107
title: An answer received shows the new mail in full
level: module
realises:
  - UC-039
  - A REPORTER'S ANSWER IS SHOWN AT ITS ISSUE
modules:
  - MOD-maintenance-pages
builds_on:
  - ITM-968
tests:
  - unit
origin:
  - finding 1 of #1142 (ITM-969, developer-sonnet-i), on main at 740567ed
---
# ITM-1107 An answer received shows the new mail in full

**REGISTER**

## Outcome

UC-039-close-or-defer-an-issue-and-reply.md:154-156 (1b): "The issue appears under *answer received*, with the new mail shown in
full". The replies page shows the new mail with only reporter, date and subject (TST-969014, marked as a finding).

## Acceptance

- A unit test naming MOD-maintenance-pages: an issue under *answer received* shows the new mail's whole text. Counter-proof:
  the header alone fails it.
- TST-969014's finding mark is removed in the same pull request, by a participant other than the implementer.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/maintenance-pages/` and its tests change.
