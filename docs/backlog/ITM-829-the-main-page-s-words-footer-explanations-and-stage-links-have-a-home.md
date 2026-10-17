---
id: ITM-829
title: The main page's words, footer, explanations and stage links have a home
level: module
realises:
  - UC-046
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-main-page
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - the count of the main page's requests before ITM-684 (sprint team1/76), by developer-sonnet-e
---
# ITM-829 The main page's words, footer, explanations and stage links have a home

**REGISTER**

## Outcome

Parts of the old main page that no module file names:
- the hero's *Review the use cases* button and its first-step paragraph;
- the footer, static in `index.html`. Once the page starts through `start.mjs`, `startSite` replaces the body
  (`src/site-frame/index.mjs:233`), so the footer would go. That is read from the code;
- the main page's folded explanations, of which `src/site-frame/explanations.md` holds none;
- the stage links carrying the product, which `menuOf` cannot give because it takes no product.

Each needs a change of MOD-main-page's or MOD-site-frame's file, so a draft for akmaier comes first. This item builds what
is accepted.

## Acceptance

- The accepted draft's parts are drawn by their modules, with tests.

**Added at ITM-827's draft stop (sprint team1/78, 2026-10-17, po-opus).** MOD-main-page's Parts do not name
`src/home/home.mjs` as taken over. The draft for MOD-main-page includes that line.
