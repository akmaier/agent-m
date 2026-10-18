---
id: ITM-927
title: The look and accessibility checks see a diagram that failed
level: unit
realises:
  - EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
  - THE SITE SERVES A SCREEN READER
modules:
  - MOD-site-frame
builds_on:
  - ITM-918
tests:
  - unit
origin:
  - ITM-918's stop (sprint team1/90), from developer-sonnet-e's finding
---
# ITM-927 The look and accessibility checks see a diagram that failed

**REGISTER**

## Outcome

`tests/site-usability.test.mjs`' wait `DRAWN` (`tests/site-usability.d/`) looks only at `.mermaid` elements and ignores a
`.unrendered` block, the one MOD-markdown-render's `renderMermaid` returns when a diagram fails. So a failed diagram neither
holds the wait nor fails the check. That is how ITM-918's failure on every live page went unseen. ITM-905's
`tests/site-accessibility.test.mjs` shares the wait. Found at ITM-918's stop (sprint team1/90, developer-sonnet-e).

## Acceptance

- The checks name each `.unrendered` block on a route as a finding of that route, so that a diagram that fails is seen. A
  test with a planted failed diagram fails the check, with a counter-proof.
- The first commit holds only the tests, and CI is red on it where a route still holds a failed diagram. No stub is
  committed.
