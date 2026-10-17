---
id: ITM-827
title: The main page is drawn by its module's home route
level: module
realises:
  - UC-046
modules:
  - MOD-main-page
builds_on:
  - ITM-826
tests:
  - unit
origin:
  - the count of the main page's requests before ITM-684 (sprint team1/76), by developer-sonnet-e
---
# ITM-827 The main page is drawn by its module's home route

**REGISTER**

## Outcome

MOD-main-page's `routes` holds only `jobs`, and its file says `home` and `job` come later. The old page draws the cards and
what waits (`src/home/cards.mjs`, `waits.mjs`), which MOD-main-page's Parts name. This item builds the `home` route from
them, on MOD-progress-measures' functions. ITM-684 then switches the page to it.

Sprint 73's agreement lists every part of the old page with the interface that draws it. The parts that have no
interface are each their own item: ITM-826, ITM-828, ITM-829, ITM-809 and ITM-655.

## Acceptance

- The `home` route draws the stages, what waits for a person and what is being built, through the module's Uses, with
  tests.
- Its requests are counted at this repository's size.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Decided at its draft stop (sprint team1/78, 2026-10-17, po-opus).**
- **Reading 1 is accepted:** the fragment `#home/product=<encoded address>`, as `startSite` writes it and `routeOf` reads
  it.
- **Reading 2 is accepted** where UC-046 quotes no other name: a card is named `owner/name`, and the instance's card
  "Agent M". The developer reads UC-046's quoted lines first (sprint 74's agreement).
- **Reading 3 is accepted.** The tests import `tests/progress-measures-load.mjs` and `tests/site-frame-start.d/dom.mjs`,
  and no fake is copied (AGENTS.md §2). The shared fake is ITM-712.
- **Reading 4 is accepted.** The red that is only a missing file is run once against an uncommitted stub, which fails the
  cases on behaviour, as the brief says.
- **The links are built here, through `ViewContext.go`.** `go(route, params)` is in MOD-site-frame's `ViewContext`
  (`MOD-site-frame.md:125`), so a wait opens its page, and *+ Add product* opens `add-product`. The card's token setting
  opens `settings`. No route address is written by hand. Their wording follows UC-046's quoted lines.
  *Get your own Agent M* is ITM-655.
- **Reading the jobs again at an interval** is ITM-847, with its requests stated first.
- **The findings** are added to ITM-828 (`reachable`), ITM-843 (the live states in `Facts`) and ITM-829 (the Parts line).
- **Without a token**, `home` costs 3,367 requests here. ITM-684 does not switch the live page before ITM-842 settles it.
- The stray `/tmp/x`, written and removed, goes to the feedback.
