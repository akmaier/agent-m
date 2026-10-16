---
id: ITM-506
title: Every route gives the prompt bar its subject, and the frame starts the bar
level: module
realises:
  - UC-049
  - A STORED SECRET IS HIDDEN UNTIL SHOWN
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-site-frame
builds_on:
  - ITM-504
  - ITM-531
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-site-frame, Parts: subject.mjs; Interfaces: Route, start
---
# ITM-506 Every route gives the prompt bar its subject, and the frame starts the bar

**REGISTER**

## Outcome

A `Route` may give `subject`, and whichever gives it, the frame sets its `entry` to the route's `entry`, `null` for a
route out of the menu; a route that gives no subject has the frame's default — the kind `converse`, the route's title, and
as the page the title, the menu entry, the product and the text the route has drawn. On the main and the review pages,
never in the Bridge's window, the frame starts `startPromptBar` in the page's foot with the store, the instance, the
chosen product, the subject of the route shown at each moment, `explain` and its navigation.

It builds on ITM-531, which starts the main and the review pages, and on ITM-504's `startPromptBar`.

What the module file leaves unstated, and what is built:
- **Where the bar stands.** A `footer` of class `site-frame-prompt-bar`, after the route's `main`, on the main and the review
  pages only. `startPromptBar` is called once per page.
- **The subject at each moment.** The shown route's `subject(params, context)` where the route gives one, else the frame's
  default. Either way `entry` is set to the route's `entry`, `null` for a route out of the menu.
- **The frame's default subject.**
  - `key` the route's name with its parameters, as the fragment writes them;
  - `title` the route's title;
  - `kind` `converse`;
  - `paramsFor` giving `{ page }`, the route's title, the menu entry's label, the chosen product's address (or the
    instance's) and the `textContent` of what the route has drawn, one per line. `textContent` holds no input's value, so a
    hidden stored secret is not in it;
  - `draftRoute` and `withhold` `null`, and `refuses` `[]`.
- **What the bar is handed.**
  - the page's store;
  - the instance as the frame connected it;
  - `product()` giving the chosen product's `{ address, host }`, or `null` for the instance;
  - `subject()` as above;
  - the frame's `explain`, and `go` writing the fragment.

No existing test's expected result changes, release tests included. The tests of ITM-531 assert the menu's and the
selector's children, not the body's. The Bridge window's tests start page `bridge`, where no bar is drawn.

## Acceptance

- In a small DOM, the bar is started on the main and the review pages and not in the Bridge's window; the subject
  follows the route shown; a hidden secret's value is not in the default page.
- The first commit holds only the tests, and CI is red on it, the stub run recorded where only a missing export makes it
  red.
- Each test states its expected values in its own text (`A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT`); an
  existing test that the change turns red is not changed here: the Developer stops and names it.
- Only `src/site-frame/` and the tests that name MOD-site-frame change.
