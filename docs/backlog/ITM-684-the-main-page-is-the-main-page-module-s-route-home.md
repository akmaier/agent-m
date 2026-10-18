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
