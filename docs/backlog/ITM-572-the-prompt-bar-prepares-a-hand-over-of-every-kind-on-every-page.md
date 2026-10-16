---
id: ITM-572
title: The prompt bar prepares a hand-over of every kind on every page
level: module
realises:
  - UC-049
modules:
  - MOD-site-frame
builds_on:
  - ITM-505
  - ITM-568
tests:
  - unit
origin:
  - ITM-568's settling at sprint team1/52: a hand-over is prepared in the tab, with the kind's recipes and preconditions, and the tab holds only the strategies of the page's views
---
# ITM-572 The prompt bar prepares a hand-over of every kind on every page

**REGISTER**

## Outcome

The prompt bar prepares a hand-over in the tab (`prepareJob` in `src/prompt-bar/hand-over.mjs`) before `handOverJob`
queues it. The tab holds only the strategies that the page's views hand `start.mjs`, as ARC-038 has it ("The entry
pages register the strategies of the modules the views include"). So a hand-over of `implement` from a page whose views
do not include its recipes and preconditions is refused with `UnknownStrategy` at the click, even once ITM-568 builds
`implementation-inputs`. Its recipes are `implementation-inputs`, `chapters-for-implementation` and `instruction?`, and
its precondition is `rests-on-accepted`.

Two facts bind the design:
- MOD-job-runner refuses a strategy registered twice (`DuplicateStrategy`, `src/job-runner/registry.mjs:18`).
- MOD-implementation-pages' view is to hand `runStrategies` too.

**Not ready for a sprint yet. It needs a draft for akmaier**, since no text says who registers the strategies of the
kinds the bar may hand over. A design is derived from AGENTS.md §2's principles before it is drafted:
- one responsibility: the frame registers what the pages need;
- nothing twice: each strategy set registered once per tab, however many views or the bar need it;
- no special first case.

## Acceptance

- On the main page and on the review pages, a hand-over of each kind the bar may hand over is prepared without
  `UnknownStrategy`.
- No strategy set is registered twice.
