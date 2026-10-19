---
id: ITM-1029
title: The mails marked not an issue are a line of the settings page with Clear
level: module
realises:
  - UC-042
  - EVERY SETTING IS REACHED FROM ONE PAGE
  - A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
modules:
  - MOD-settings-pages
builds_on:
  - ITM-957
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-042-4, read against the accepted texts on main at 40e04d8d
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-1029 The mails marked not an issue are a line of the settings page with Clear

**REGISTER**

## Outcome

MOD-settings-pages.md:132-134: "`settings` — three sections — this browser, the instance, each product —, one line per setting
with its state ... A browser setting has *Test*, *Change* and *Clear*". The setting is `not-an-issue` (ITM-957). It holds
identifiers only, so the line shows how many mails are marked and *Clear*; there is nothing to test or change.

## Acceptance

- Unit tests that name MOD-settings-pages: with three marked identifiers the line says three and offers *Clear*, which after
  one confirmation removes the key from `localStorage`; with none, *not set*.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/settings-pages/` and the tests that name MOD-settings-pages change.
