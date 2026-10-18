---
id: ITM-942
title: The review pages read the impact lists stored for their commit
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
  - A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT
  - AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST
  - UC-008
  - UC-023
modules:
  - MOD-review-pages
builds_on:
  - ITM-939
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18, and docs/measurements/2026-10-18_review-all-on-the-real-network.md
---
# ITM-942 The review pages read the impact lists stored for their commit

**REGISTER**

## Outcome

Rests on the draft `c6baba33`, MOD-review-pages.md:205-210. It starts when akmaier has accepted it, and the quote is checked
against the accepted blob first. "For a changed decision or module file, on `<k>/<id>` and in `<k>/all`, the page first
reads the impact lists stored for the commit it shows ... calls neither `traceGraph` nor `lastAcceptedText` for them.
Where no entry fits, it derives both as before."

Today `src/review-pages/flow.mjs:338-358` calls `lastAcceptedText` once per changed file, one after another, and builds
the graph through `graphOnce`. Each call reads whole trees.

## Acceptance

- Unit tests that name MOD-review-pages, over a fake host whose `trace-cache` holds a fitting entry for a changed module
  file:
  - `<k>/all` shows the stored impact list and the difference against the text at `before`;
  - no `traceGraph` read and no `lastAcceptedText` call is made, which is counted.
  - With a stale entry (another blob), the page derives both as before.
- Counter-proof: ignoring the stored entry fails the count test.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/review-pages/` and the tests that name MOD-review-pages change.

## Read at sprint team2/94's second plan (po-opus-b)

The draft `c6baba33` is accepted in `8bf67a3b`. Each module's current blob is the draft's blob, so the quotes and their lines
stand.
