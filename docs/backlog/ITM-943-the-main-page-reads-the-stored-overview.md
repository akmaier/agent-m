---
id: ITM-943
title: The main page reads the overview stored for its head, and then only the build
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
  - UC-049
modules:
  - MOD-main-page
builds_on:
  - ITM-940
tests:
  - unit
origin:
  - akmaier's direction of 2026-10-18 ("Same is true for the overview on the first page")
---
# ITM-943 The main page reads the overview stored for its head, and then only the build

**REGISTER**

## Outcome

Rests on the draft `c6baba33`, MOD-main-page.md:86-91. It starts when akmaier has accepted it, and the quote is checked
against the accepted blob first. "A card first reads the overview stored for its default branch's head ... its stage bar
and what waits come from it, and only the build is read, with `productFacts`' scope `build`. Where there is none, the
card reads the scope `all` as before."

The route `home` is still served by `src/home/`, which belongs to no module. ITM-684 switches it to MOD-main-page's
`home`. This item builds the card in MOD-main-page, and it reaches the live page with ITM-684.

## Acceptance

- Unit tests that name MOD-main-page, over a fake host whose `overview-cache` holds the head's overview:
  - the card shows the stored shares and waits;
  - it reads no use case, decision or test file, which is counted;
  - without a stored overview it reads the scope `all` as before.
- Counter-proof: ignoring the stored overview fails the count test.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/main-page/` and the tests that name MOD-main-page change.
