---
id: ITM-918
title: The component diagram draws on the architecture pages
level: module
realises:
  - UC-025
  - EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
modules:
  - MOD-trace-pages
builds_on:
  - ITM-904
tests:
  - unit
origin:
  - ITM-904's findings (sprint team1/89), `tests/site-usability.test.mjs`
---
# ITM-918 The component diagram draws on the architecture pages

**REGISTER**

## Outcome

**A lead from ITM-904.** In the check's Electron, locally and on CI, `#arc` and `#module` show "Diagram error: Cannot read
properties of null (reading 'getAttribute')" (`src/trace-pages/flow.mjs:394`). The diagram's source block then stands in its
place, and that block is what is too wide at a phone's width. It has not been seen in a visible window.

**First task, the stop clause:** reproduce the error in a page as the live app draws it, and name its cause. If it occurs
only in the test's Electron, the item stops and the check's todo is read again.

## Acceptance

- `#arc` and `#module` draw the component diagram, with no error, in the check's Electron. The width todo for both routes
  is removed, or names what remains. A test checks the diagram's drawing, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
