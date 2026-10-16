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

On the main page, MOD-site-frame's menu tells the entries the review pages serve from those not yet built, without
loading the review pages' views, as its file says of `data-menu-views`. ITM-531 builds the main page's menu by importing
each view `data-menu-views` names and reading its routes' `entry` (`src/site-frame/index.mjs`, `startSite`). That loads
them, which the file says the main page does not do.

The start decision that selects this item settles, from MOD-site-frame's file, how the main page knows which entries the
named views serve without loading them. One reading is that `menu.mjs`, which holds "the eight entries of the menu and the
links they lead to", names the view that serves each entry. That reading must be checked against `Route.entry`, so that
the two are not two copies of one fact. If no reading of the texts allows it, a draft of MOD-site-frame's file goes to
akmaier for acceptance.

## Acceptance

- On the main page, no view module that `data-menu-views` names is imported, and the menu marks as built exactly the
  entries those views serve.
- Each test states its expected values in its own text.
