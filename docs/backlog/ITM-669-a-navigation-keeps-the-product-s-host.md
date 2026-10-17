---
id: ITM-669
title: A navigation keeps the product's host
level: module
realises:
  - UC-020
modules:
  - MOD-site-frame
builds_on:
tests:
  - unit
origin:
  - ITM-599's gate on pull request #708 (docs/gates/20261017-0836-development-release-testing-e7a1.md), from developer-sonnet-d's finding
---
# ITM-669 A navigation keeps the product's host

**REGISTER**

## Outcome

The frame builds a new Host at every change of the fragment (`chosenProduct`, `src/site-frame/routing.mjs:65`). A
Host's cache of blobs read is lost with it, so a view drawn again after a navigation reads its files again. ITM-599 kept
its graph across that by the page's store. Before a change, the start measures what a navigation costs today: the
requests of drawing `#spec`, going to Gaps and back, with and without a token (sprint 66's and 67's agreements, as a
committed test). It decides from that whether the frame keeps the Host while the product stays the same.

## Acceptance

- A navigation that keeps the product reuses its Host, and the committed test counts no second read of a blob already read.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
