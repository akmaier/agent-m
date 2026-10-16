---
gate: Development → Release testing
job:
decider: po-opus
role: Product Owner
decision: passed
on:
  - 69ce885aa6bdaef5d0245db212cb1263b796b01c
  - https://github.com/akmaier/agent-m/pull/577
date: 2026-10-16 12:54 UTC
---
# Development → Release testing: ITM-531, The frame starts the main and the review pages

**REGISTER**

## Reason

ITM-531, pull request #577 into `sprint/team1/42`, at head `69ce885a`. That head is a merge of `sprint/team1/42` into the
item's branch, which brings the change between jobs #579; nothing was rewritten. developer-sonnet-b made the item's two
commits. It lists AGENTS.md, SPEC.md, chapters 9, 11, 12 and 13, the item, `42.md` and MOD-site-frame as read in full.

1. **The red commit.** The tests-only commit `657f68e2` was pushed alone, and CI was red on it (run 38900481257). It failed
   on exactly the item's 13 tests. The stub run is recorded:
   - TST-531010 to TST-531013 fail on their assertions;
   - TST-531001 to TST-531009 fail on `startPage`'s old refusal of every page but the Bridge's.
2. **CI is green on the head**: ten of ten jobs, `test_no_backend` included. The pull request is mergeable.
   - The Bridge window's tests, release-itm-275 among them, pass 64 of 64, as on the base.
   - The full node run fails only the 28 known `imapflow` tests, as on the base.
3. **The changes stay in the item's scope.** `src/site-frame/index.mjs` and the new `menu.mjs`, `routing.mjs` and
   `start.mjs`, two new test files and their fixtures. No existing test changed, and the entry pages are untouched, as the
   cut says.
4. **The new tests.** TST-531001 to TST-531013 state their values in their own text. Seventeen planted faults are
   recorded in #577.
5. **The Acceptance holds.** The review page draws:
   - the header, the eight entries in their order and the selector with the instance first;
   - the route the fragment names, and the next on a change;
   - "not built yet" for an unserved entry.
   It starts `watchForAcceptance` once. `start.mjs` starts a fixture page from its script tag, and the Bridge's window
   starts as before.

**One reading does not hold, and becomes ITM-534.** For the main page, the developer imports each view
`data-menu-views` names to read its routes' `entry`, and reads "without loading them" as "without registering or
rendering them". That reading adds words the text does not contain (`AGENTS.md` §6a.7). MOD-site-frame's file says the
main page tells built entries from the rest "without loading them". The item's Acceptance does not test the main page's
menu, and the entry pages do not load the frame yet. So the gate passes, and ITM-534 settles how the main page knows the
entries without loading the views.

The other readings named in #577 are within the accepted texts:
- `menuOf` links to `#<key>`, or into the review pages from the main page;
- the product is the fragment's `product=<web address>`, the form MOD-settings-pages already writes;
- each repository is connected with its own token;
- the notices built are *Finish setting up* and an unknown product. The expiry notice needs functions its modules do not
  provide yet.
