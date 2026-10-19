---
id: ITM-951
title: A fetched legal text's + New version explains the fetch run where it starts it
level: module
realises:
  - EVERY STEP EXPLAINS ITSELF
  - UC-016
modules:
  - MOD-settings-pages
builds_on:
  - ITM-915
tests:
  - unit
origin:
  - developer-sonnet-d's finding on ITM-915's pull request #922 (sprint team1/92)
---
# ITM-951 A fetched legal text's + New version explains the fetch run where it starts it

**REGISTER**

## Outcome

**A lead from ITM-915 (developer-sonnet-d).** For a fetched EU legal text that already has a version, *+ New version*
starts the fetch run at once and never opens the panel (`src/settings-pages/library.mjs:374-386`). MOD-settings-pages.md:183
states that this starts the fetch run. Since ITM-915, the topic `source-new-version` explains what a new version records
for each kind, including a fetched legal text. If that explanation is drawn only inside the panel, it is never shown for
a fetched legal text.

**First task:** read where the library draws `source-new-version`. If the person sees it beside *+ New version* before
pressing it, the item stops and reports that.

## Acceptance

- For a fetched legal text with a version, the explanation of what *+ New version* does is shown and can be expanded
  before the person presses it. A test checks this, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
