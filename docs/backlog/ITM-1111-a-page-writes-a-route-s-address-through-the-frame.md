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

## Not ready: a draft for akmaier

The draft `a7fa3d01` was reviewed, and was withdrawn in `391cf759` so that the security fix's uses draft `7377eaa2` is
the only draft on MOD-site-frame.md. akmaier has since accepted MOD-site-frame with that draft in it (`b6c70419`), so the
draft can be committed again for akmaier; `git show a7fa3d01` holds its text. `MOD-site-frame.md:178` still gives the
`ViewContext` only `go`, and the replies page writes its issue link by hand (`src/maintenance-pages/replies.mjs:307`).

The draft gives the `ViewContext` the address of a route with its parameters, as `go` would go there. MOD-maintenance-pages'
links take it from there.

## Acceptance

- Once the draft is accepted: the replies page's issue link is the frame's address for `replies` with `issue` and `product`.
  Counter-proof: a hand-written link fails it.

**A second caller (team 2's sprint 100, po-opus-b).** ITM-684's live main page links its waits, its card's token setting
and *+ Add product* into `docs/index.html`.
- *+ Add product* now goes through `context.go("add-product")` (`src/main-page/home.mjs:121`). The link *Get your own*
  is still made by hand, from the settings entry's address `menuOf` gives, its end replaced (`home.mjs:117`).
- This item's draft, when it is committed again, also gives the address of a review page's route on the main page, so
  that the copy goes.

