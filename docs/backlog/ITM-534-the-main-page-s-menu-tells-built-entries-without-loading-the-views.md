---
id: ITM-534
title: The main page's menu tells built entries without loading the review pages' views
level: module
realises:
  - THE MENU FOLLOWS THE PROCESS
modules:
  - MOD-site-frame
builds_on:
  - ITM-531
tests:
  - unit
origin:
  - the gate of #577 (ITM-531, sprint team1/42)
  - MOD-site-frame, Data: the page setup — `data-menu-views` lets the main page's menu "tell built entries from those not yet built without loading them"
---
# ITM-534 The main page's menu tells built entries without loading the review pages' views

**REGISTER**

## Outcome

It builds against the draft of MOD-site-frame's file committed on `main` for akmaier's acceptance. ITM-531 builds the
main page's menu by importing each view `data-menu-views` names, which the file says the main page does not do. No reading
of the file lets the main page tell built entries without some copy of what each view's `Route.entry` says. So the draft
drops `data-menu-views` and `PageSetup.menuViews`: on the main page every entry links into the review pages, which say
there when an entry is not built yet.

Once the draft is accepted, `startPage` and `start.mjs` take no `menuViews`, and the main page imports no view. The tests
of ITM-531 that pass `menuViews` change only that call: TST-531001 to TST-531013 where they name it, as the item lists
them at its start.

## Acceptance

- On the main page, no view module that `data-menu-views` names is imported, and the menu marks as built exactly the
  entries those views serve.
- Each test states its expected values in its own text.
