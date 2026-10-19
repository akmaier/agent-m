---
id: ITM-1108
title: The replies page's link to an issue is an address the frame reads
level: module
realises:
  - UC-039
modules:
  - MOD-maintenance-pages
builds_on:
  - ITM-966
tests:
  - unit
origin:
  - finding 2 of #1142 (ITM-969, developer-sonnet-i), on main at 740567ed
---
# ITM-1108 The replies page's link to an issue is an address the frame reads

**REGISTER**

## Outcome

The replies page writes the link to an issue as `#replies/issue=4&product=…`. MOD-site-frame.md:133 makes the parts of the
fragment after its first the route's `params`, which the frame reads split by `/` (`src/site-frame/routing.mjs`, `fragmentOf`), so
it expects `#replies/issue=4/product=…`. Followed as a plain link (a new tab, a copied address), the issue reads as
"4&product=…".

## Acceptance

- A unit test naming MOD-maintenance-pages: the issue's link is the address the route's own `go` writes, and opening it shows
  that issue of that product. Counter-proof: the `&` form fails it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/maintenance-pages/` and its tests change.
