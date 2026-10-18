---
id: ITM-992
title: The Settings page shows the mailbox set or not, and its Change opens the route mailbox
level: module
realises:
  - UC-037
  - EVERY SETTING IS REACHED FROM ONE PAGE
  - A BROWSER SETTING IS TESTED AND CLEARED WHERE IT IS SHOWN
modules:
  - MOD-settings-pages
builds_on:
  - ITM-429
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-037-1, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-992 The Settings page shows the mailbox set or not, and its Change opens the route mailbox

**REGISTER**

## Outcome
- UC-037.md:75: "The author opens **Settings → Mailbox** and presses **Connect a mailbox**".
- MOD-settings-pages.md:132-134 (accepted `447a1a58`:131-133): "`settings` — … one line per setting with its state: … not
  set. A browser setting has *Test*, *Change* and *Clear*".
- MOD-browser-store.md:116-117: `listSettings` gives "every setting the catalogue knows, set or not, with … where it is set
  up". Today the key `mailbox` gives `setUpIn: "mailbox"`.

Today the Settings page draws the mailbox line only once a mailbox is stored (`src/settings-pages/settings.mjs:1146`).
There is no control that leads to the route `mailbox`, which a person can reach only by its address.

The item draws the mailbox line in the tab *Endpoints & Agents* in both states:
- **not set:** with *Connect a mailbox*, which opens the route `mailbox` (`context.go("mailbox", {})`);
- **connected:** `mailboxLine` as now, plus *Change*, which opens the same route.

The reading taken: *Change* of the mailbox is the route `mailbox`, as *Change* of an endpoint is the route `endpoints`
(`settings.mjs:118`).

## Acceptance
- Unit tests that name MOD-settings-pages, over a store without `mailbox`:
  - the Settings page shows the mailbox line *not set*, with *Connect a mailbox*;
  - its click calls `go("mailbox")`;
  - with a stored connection, the line shows *Change*, which does the same.
- Counter-proof: with the line removed for an unset mailbox, the first test fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/settings-pages/` and the tests that name MOD-settings-pages change.

**Independence of team 1.** It touches team 1's module. team1/92.md:114: "MOD-settings-pages: ITM-638, ITM-642, ITM-639, ITM-703;".
team1/92.md:159-161: "The four MOD-settings-pages items wait. With the draft on `main`, MOD-settings-pages' current text
has no approval record." It is READY on the accepted text, but it can start only once sprint 92 releases the module and
akmaier has accepted the draft `c865b058` or it has been withdrawn.

**Read again at registration (po-opus-b).** MOD-settings-pages' current blob is *changed* by team 1's draft (`dcf9e549`); the
quoted lines stand in it and in the accepted blob `447a1a58`. The item starts once team 1's sprint 92 leaves
MOD-settings-pages and the draft is decided.

