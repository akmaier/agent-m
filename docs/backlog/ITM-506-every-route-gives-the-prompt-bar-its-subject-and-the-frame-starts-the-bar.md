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
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-site-frame, Parts: subject.mjs; Interfaces: Route, start
---
# ITM-506 Every route gives the prompt bar its subject, and the frame starts the bar

**REGISTER**

## Outcome

A `Route` may give `subject`; one that gives none has the frame's default — the kind `converse`, the route's title, and
as the page the title, the menu entry, the product and the text the route has drawn. On the main and the review pages,
never in the Bridge's window, the frame starts `startPromptBar` in the page's foot with the store, the instance, the
chosen product, the subject of the route shown at each moment, `explain` and its navigation.

## Acceptance

- In a small DOM, the bar is started on the main and the review pages and not in the Bridge's window; the subject
  follows the route shown; a hidden secret's value is not in the default page.
