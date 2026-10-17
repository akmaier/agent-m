---
id: ITM-648
title: An opened requirement shows the open proposals that touch it
level: module
realises:
  - UC-020
  - OPEN PROPOSALS ARE SHOWN IN THE BROWSER
modules:
  - MOD-trace-pages
builds_on:
  - ITM-597
tests:
  - unit
  - system
origin:
  - ITM-597's gate on pull request #690 (docs/gates/20261017-0533-development-release-testing-7f40.md)
---
# ITM-648 An opened requirement shows the open proposals that touch it

**REGISTER**

## Outcome

Cut from ITM-597 at its gate. UC-020 step 5, "Open proposals touching it", and 5c, "Both are listed; the browser notes
that accepting one makes the other stale".

ITM-597's code decided by itself what an open entry changes and withdraws: it read the proposal as a SPEC section and
compared it with the section of the entry's anchor, ignoring `until`. MOD-spec-changes already states that rule:
`entryView` gives an entry's `impact`, each name `changed`, `withdrawn` or `added`. A second copy in MOD-trace-pages
would diverge from it, and already did on `until` (sprint 60's agreement).

So the view takes each open entry's `impact` from `entryView`. It waits for akmaier's acceptance of the draft committed
with ITM-597's gate, which adds `MOD-spec-changes.entryView` to MOD-trace-pages' Uses.

## Acceptance

- An opened requirement lists every open entry whose `impact` names it, with the entry's state, the impact's kind and a link to the entry.
- Two such entries carry the note that accepting one makes the other stale.
- No rule of what an entry changes is written in MOD-trace-pages.
- Its tests in `tests/trace-pages-specification.test.mjs` guard `OPEN PROPOSALS ARE SHOWN IN THE BROWSER` by name.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
