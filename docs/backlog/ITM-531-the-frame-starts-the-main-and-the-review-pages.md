---
id: ITM-531
title: The frame starts the main and the review pages
level: module
realises:
  - THE MENU FOLLOWS THE PROCESS
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - MOD-site-frame, Parts: start.mjs, menu.mjs, routing.mjs; Interfaces: PageSetup, startPage
  - sprint team1/41's start decision: ITM-506 starts the prompt bar on the main and the review pages, which the frame does not start yet
---
# ITM-531 The frame starts the main and the review pages

**REGISTER**

## Outcome

MOD-site-frame's `startPage` starts the main and the review pages, as its file states it. Today it starts the Bridge's
window only (`src/site-frame/index.mjs`: "This delivered frame starts the Bridge page only"), and `start.mjs`, the script
both entry pages load, does not exist. The site's entry page still loads `docs/assets/dashboard-app.mjs`.

For a `PageSetup` of page `main` or `review`, it:
- draws the header, the menu in the order of `THE MENU FOLLOWS THE PROCESS` and the product selector;
- shows the notices;
- connects the instance and the chosen product;
- renders the route the fragment names, again on every change of the fragment;
- starts MOD-notifications' `watchForAcceptance`.
`start.mjs` reads the page's setup from its own script tag, loads the named view modules, registers their strategies and
calls `startPage`.

Moving the entry pages onto `start.mjs` changes files no module owns, so it is a change between jobs of the sprint that
selects this item.

## Acceptance

- In a small DOM, `startPage({ page: "review", views, menuViews })` draws the header, the menu's eight entries in their
  order and the route the fragment names, and renders the next route on a change of the fragment.
- `start.mjs` reads a fixture script tag's setup and starts the page with the named views.
- The Bridge's window is started as before.
