---
id: ITM-933
title: The look and accessibility checks meet a changed file
level: module
realises:
  - EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
  - THE SITE SERVES A SCREEN READER
modules:
  - MOD-site-frame
builds_on:
  - ITM-921
tests:
  - unit
origin:
  - developer-sonnet-d's measurement on ITM-921's pull request #899 (sprint team1/90)
---
# ITM-933 The look and accessibility checks meet a changed file

**REGISTER**

## Outcome

The checks' fixture product (`tests/site-usability.d/product.mjs`) has no file changed since acceptance. So no route draws a
difference box (`pre.diff`), and neither check meets one. ITM-921 makes that box focusable and tests it in a unit test, and
the system checks never see it. Found by developer-sonnet-d on #899.

## Acceptance

- The fixture holds a file changed since its acceptance, so that its page and Review all draw a difference box. Both checks
  pass over it, with a counter-proof (the box not focusable is found).
- The first commit holds only the tests. No stub is committed.
