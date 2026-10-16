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

For a `PageSetup` of page `main` or `review`, `startPage`:
- draws the header, the menu by `menuOf` in the order of `THE MENU FOLLOWS THE PROCESS`, and the product selector;
- shows the notices;
- connects the instance and the product `chosenProduct` names;
- renders the route the fragment names, again on every change of the fragment;
- starts MOD-notifications' `watchForAcceptance`.

`start.mjs` reads the page's setup from its own script tag (`data-page`, `data-views`, `data-menu-views`), loads the named
view modules, registers their strategies and calls `startPage`. The Bridge's window is started as before.

What the module file leaves unstated, and what is built:
- **The product selector.** A `select` in the header that offers the instance first, then each product the store's
  setting `products` keeps, by its address, and the entry *+ Add product*, which goes to the add-product route of the
  settings. Choosing one sets the fragment's product.
- **A fragment naming no loaded route.** It shows the first loaded route of its menu entry. With none, a paragraph says
  that the entry is not built yet.
- **The view modules.** `data-views` slugs are loaded as `../<slug>/index.mjs` relative to `start.mjs`. Each module's
  `view` gives `routes` and `strategies`, which are registered with MOD-job-runner's `registerStrategies` under the
  module's slug.

Moving the entry pages (`docs/index.html` and the review page) onto `start.mjs` is not part of this item. They keep
loading the dashboard until the views the menu names are built, and that move is a change between jobs of a later sprint.

No existing test's expected result changes, release tests included. The tests of the Bridge's window
(`tests/release-itm-275-bridge-frame.test.mjs` and the site-frame tests) start page `bridge`, which keeps its behaviour.

## Acceptance

- In a small DOM, `startPage({ page: "review", views, menuViews })`:
  - draws the header, the menu's eight entries in their order and the selector with the instance first;
  - renders the route the fragment names, and the next on a change of the fragment;
  - says "not built yet" for an entry no loaded view serves;
  - starts `watchForAcceptance` once.
- `start.mjs` reads a fixture script tag's setup, loads the named fixture views and starts the page with them.
- The Bridge's window is started as before.
- The first commit holds only the tests, and CI is red on it. If it fails only because a function does not exist yet, the
  stub run is recorded.
- Each test states its expected values in its own text (`A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT`); an
  existing test that the change turns red is not changed here: the Developer stops and names it.
- Only `src/site-frame/` and the tests that name MOD-site-frame change.
