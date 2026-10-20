---
id: ITM-684
title: The main page is the main-page module's route home
level: module
realises:
  - EVERY CODE FILE BELONGS TO A MODULE
  - THE MAIN PAGE SHOWS WHAT GOES ON IN THE INSTANCE
modules:
  - MOD-main-page
builds_on:
  - ITM-685
  - ITM-826
  - ITM-827
  - ITM-828
  - ITM-829
  - ITM-809
  - ITM-655
  - ITM-842
  - ITM-1165
tests:
  - unit
origin:
  - the plan of moving the code outside the architecture into it (sprint team1/70), under `CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT` and `docs/measurements/2026-10-17_code-outside-every-module.md`
---
# ITM-684 The main page is the main-page module's route home

**REGISTER**

## Outcome

MOD-main-page builds its route `home` from `src/home/home.mjs` and `cards.mjs`, as its Parts `cards.mjs` and
`waits.mjs` state. `index.html` loads `start.mjs` with this module's view, and `src/home/` goes. The progress it shows is
MOD-progress-measures' (ITM-685).

It waits for akmaier's acceptance of the module-file draft committed with the plan, which names these files as taken over in the module's Parts.

## Acceptance

- Every file the module's file names as taken over for this item is moved into the module or removed, as that line says, and no other file outside the module changes.
- The live dashboard keeps working: the release tests of its pages pass on the item's head.
- A test of only a removed file goes with it, and the requirement it guarded is kept by a test of the module, named in the pull request.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Noted at ITM-685's gate (sprint team1/74, 2026-10-17, po-opus).** MOD-progress-measures' `productFacts` builds only the
scope `work`. With it, `requirements`, `graph`, `tests`, `results`, `tags` and `modelSince` are `"unknown"`, so the
Requirements, Tests and Release stages have no share. The main page calls it with the scope `all`, and its request count
is measured at this item's start. The instance's own bar waits for ITM-809.

**Read at sprint team1/76 (2026-10-17, po-opus), from developer-sonnet-e's count.** The page this item replaces sends
1006 requests per load. Sprint 73's agreement names eleven parts that no interface draws yet. They are ITM-826 to 829,
ITM-809 and ITM-655, and this item builds on them. It is not selected before they are done.

**Noted at ITM-827's gate (sprint team1/78, 2026-10-17, po-opus).** The `home` route's links go through `ViewContext.go`,
which on the main page only sets `location.hash`. The main page loads no other module's view, so *Open* on a use case, a
SPEC change, a gate or a failed job, *+ Add product* and *Open the token's setting* would land on "This page is not built
yet". MOD-main-page's `job` route is not built either.

This item switches the live page. It does not switch it until every route `home` links to is served: through the views
`start.mjs` loads (`data-views`, as ITM-700 sets them), or by the frame. A test opens each link and finds its page.

**Noted at ITM-854's gate (sprint team1/80, 2026-10-17, po-opus).** The old `src/home/home.mjs` connects the notifications'
host once, with the token of the moment, as the frame did before ITM-854. It goes when this item switches the main page, and
the new page's notifications follow the store as the frame's do.

**Noted at ITM-880's gate (sprint team2/89, 2026-10-18, po-opus-b).** The live main page breaks `A PAGE LOAD READS THE
REPOSITORY IN BATCHES` (SPEC.md:672). The main page is "the dashboard of what goes on in the instance" (SPEC.md:902). With a
token it reads the texts its cards and its waits list show one by one.
- Replayed at `dccd7cc3` through `tests/app-harness.mjs`, with every text file of the commit: `index.html`'s
  `src/home/home.mjs` sends 1,072 requests, with a token and without.
- Of these, 1,069 are single file reads: 691 backlog items, 372 job records, 5 files of change queues and `SPEC.md`.
  The cause is that `read` (`src/home/home.mjs:46-57`) hands `productFacts` `snapshot.read` and never calls `readMany`.
- The same facts through MOD-main-page's route `home` (ITM-826, ITM-827) take 50 requests with a token (measurement
  `docs/measurements/2026-10-18_page-loads-once-per-commit.md` §2).
- The file belongs to no module, so it is not fixed in place (`CODE OUTSIDE THE ARCHITECTURE IS MOVED INTO IT`,
  SPEC.md:1441). This item's switch is the fix.

**Stopped at its first task, and decided (team 2's sprint 100, po-opus-b, with architecture-reviewer a2fd6f0bd4f5027fd).**

developer-sonnet-h ran the real `startPage({ page: "main", views: [mainPage.view] })`.
- The known positive, `#job/id=…`, is served.
- These fall back to `routes[0]` or say "not built yet": `#use-case/id=…` and `#spec-entry/id=…`
  (`src/main-page/waits.mjs:14-15`), `#process` for a gate (`:17-20`), `#add-product` (`home.mjs:98`) and `#settings`
  (`cards.mjs:92`).
- The cause: each is `context.go()`, which on the main page only sets the hash (`src/site-frame/index.mjs:347-350`).

**The way, by the texts: links, not loaded views.**
- MOD-site-frame.md:172-173 reads "On the main page each entry links into the review pages … so that the main page loads
  none of their views". MOD-main-page.md:110 reads "each item linked to the page where it is decided".
- So these become links into `docs/index.html`, as *Get your own Agent M* and `menuOf("main")` already are. No draft is
  needed.
- `tests/main-page-home.test.mjs`, MOD-main-page's own test, changes with them.
- **Named, principle 2:** the main page writes the `docs/index.html#<route>/<params>` form itself, a second copy of the
  frame's internal writer (MOD-site-frame.md:158). ITM-1111, the frame's `addressOf`, now also covers the review pages'
  addresses for this caller, and the copy goes with it.

**What the live `docs/index.html` serves today**, probed with `tests/app-harness.mjs`' `openDashboard`, against
`#zz-not-a-route`:
- served: `#settings`, `#use-case/id=…`, `#spec-entry/id=…`, `#process` and `#add`;
- not served: `#add-product` and `#get-your-own`, which render the same use-case list as the negative.
- Today's live main page links "+ Add product" to `docs/index.html#add` (`src/home/home.mjs:79`).

**The order.**
- ITM-700 switches `docs/index.html`, and builds on this item through ITM-687 and ITM-689. So the live app learns the two
  names first, which is ITM-1165, and this item builds on it.
- ITM-1165 changes MOD-site-frame, which team 1's sprint 102 (ITM-768, 769, 658, 667) uses. So it waits for that sprint to
  reach `main` (SPEC.md:1678-1680).
- This item leaves sprint 100 until then.

