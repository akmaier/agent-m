---
id: ITM-877
title: Review all opens each difference at its first change
level: module
realises:
  - UC-008
  - UC-023
modules:
  - MOD-review-pages
builds_on:
  - ITM-876
tests:
  - unit
origin:
  - akmaier's report of 2026-10-18 of a regression on the spec, use case and architecture pages, relayed by scrum-master-opus
---
# ITM-877 Review all opens each difference at its first change

**REGISTER**

## Outcome

akmaier: Review all "should show a text box with sliders for each change and set the view port to be centered on the
first change in the file".

**No text states this.** UC-008 2a and 3e, UC-023 step 5 and MOD-review-pages.md:176-192 say that the difference is
shown, but not where its box opens. The view never existed, either: a search of `caad73d3^` and of `main` for
`scrollTop`, `scrollIntoView` and "first change" over `docs/assets` and `src` finds nothing. The positive control: the
same search finds "first change" in `src/group-document/moves.mjs:8`. So this is new behaviour, not restored behaviour.
It needs akmaier's acceptance of a sentence in MOD-review-pages.md, which this item proposes as a draft.

**The draft sentence for akmaier**, to follow "a changed one as its difference" in MOD-review-pages.md's `<k>/all` and
`<k>/<id>`: "each difference in a box of its own that scrolls, opened with its first change in the middle of the box".

MOD-review-pages is held by team 2's ITM-728 now, so the draft is committed once that hold ends. It is written here so
that akmaier can accept it at once.

## Acceptance

- Each difference on Review all and on a file's page opens in its own scrolling box, with its first changed line in the
  middle of the box. A test in a small DOM checks the box's scroll position against the line's, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
