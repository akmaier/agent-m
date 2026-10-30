---
id: ITM-1111
title: A page writes a route's address through the frame, not by hand
level: module
realises:
  - UC-039
modules:
  - MOD-site-frame
  - MOD-maintenance-pages
builds_on:
  - ITM-1108
tests:
  - unit
origin:
  - the gate of #1158 (ITM-1108), sprint team2/97, on main at 7f7f4e3b
---
# ITM-1111 A page writes a route's address through the frame, not by hand

**REGISTER**

## Outcome

ITM-1108 makes the replies page write the link to an issue as `#replies/issue=<n>/product=<encoded>`, by hand. The frame owns
how an address's fragment is written and read (MOD-site-frame.md:133; `src/site-frame/routing.mjs`, `fragmentOf`). The
`ViewContext` gives a route `go(route, params)` to navigate (:141), but nothing to write an address as a link. So the page
holds a second copy of the frame's format (AGENTS.md §2, principle 2), and finding 2 of ITM-969 came from such a copy.

## The reading of the accepted text

A page writes no route's address at all: it goes there through `ViewContext.go(route, params)` (MOD-site-frame.md:187),
which the frame turns into the address (:191-193), as *+ Add product* does (`context.go("add-product")`,
`src/main-page/home.mjs:139`).
- The replies page's control *Open* calls `go("replies", { issue, product })` and carries no address of its own. It
  already calls `go` on a click (`src/maintenance-pages/replies.mjs:309`); the hand-written address beside it
  (`:307`) goes.
- No member of `ViewContext` changes.

## Acceptance

- The replies page's *Open* of an issue goes to `replies` with `issue` and `product` through `go`, and the page's text
  holds no address `#replies/…`. The control keeps an accessible name. Counter-proof: a hand-written address fails it.
- The first commit holds only the tests, and CI is red on it.

