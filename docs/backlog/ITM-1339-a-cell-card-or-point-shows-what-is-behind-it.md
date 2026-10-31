---
id: ITM-1339
title: A cell, a card or a point on the progress page shows the items behind it and their trace
level: module
realises:
  - UC-035
modules:
  - MOD-implementation-pages
builds_on:
  - ITM-800
  - ITM-806
tests:
  - unit
origin:
  - finding UC035-S3 of ITM-806's system test TST-806009 (#1590), ruled at its gate in team1's sprint 138 (docs/backlog/sprints/team1/138.md)
---
# ITM-1339 A cell, a card or a point on the progress page shows the items behind it and their trace

**REGISTER**

## Outcome

UC-035 step 6: a click on a cell, a card or a point shows "the items or requirements behind it and their traceability". Every cell, card and chart links the same address, `#trace/key=specification/ref=<ref>` (`traceHref`, `src/implementation-pages/progress.mjs:244`), which names none of them.

## Acceptance

- Each cell, card and point leads to the items or requirements behind it and their trace (requirement → use case → item or plan entry → pull request → tests); two cells with different items lead to different places.
- TST-806009 loses its `todo`, in a commit of a participant who implements none of this item.
- Before selection, the planning reads whether the accepted module files state this; if they do not, the item is a gap of
  the architecture, for akmaier.
- No other existing expected result changes, unless a probe names it and the accepted text allows it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
