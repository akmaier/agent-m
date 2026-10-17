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
