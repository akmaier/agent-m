---
id: ITM-1316
title: An item whose requirement is withdrawn or changed is marked, and pointed at its replacement or removed
level: module
realises:
  - UC-032
  - A BACKLOG ITEM NAMES WHAT IT REALISES
  - A PERSON'S OWN INPUT IS COMMITTED DIRECTLY
modules:
  - MOD-work-plans
  - MOD-implementation-pages
builds_on:
  - ITM-782
tests:
  - unit
origin:
  - po-opus-c's planning of sprint team1/127, ITM-782's reading of UC-032 1a
---
# ITM-1316 An item whose requirement is withdrawn or changed is marked, and pointed at its replacement or removed

**REGISTER**

## Outcome

UC-032 1a: "A requirement an item realises is withdrawn or changed. The item is marked. Agent M offers to point it at
the replacing requirement, or to remove it. Nothing changes until the Product Owner decides."

MOD-work-plans states the mark: "A requirement or use case it realises that is withdrawn, changed or not accepted, or an
item it builds on that is not done, marks a `done` item: its `reason` names that" (MOD-work-plans.md:130-131).
`itemStates` gives a `done` item no reason at all (`src/work-plans/states.mjs:173-179`, `reason: null` for a merged pull
request and for `built_by`). MOD-implementation-pages offers, on the route `backlog`, "an item pointed at a replacing
requirement or removed, with `saveItems`" (MOD-implementation-pages.md:170-171); the route draws each row's `state` from
the stored `BacklogView`, whose rows carry the `ItemState` (MOD-progress-measures.md:280-286).

With this item, a `done` item whose realised requirement or use case is withdrawn, changed or not accepted carries that
in its `reason`, and the backlog page offers, on such a row, to point it at a replacing requirement or to remove it, with
`saveItems`, on the person's click.

## Acceptance

- Unit cases of MOD-work-plans: a done item that realises a requirement the SPEC no longer holds names it in its
  `reason`; known positive: a done item whose requirements stand has the reason it has today.
- A unit case of the route `backlog`: such a row offers *Point at* and *Remove*; a click writes one commit through
  `saveItems`; nothing is written before it.
- Before selection, a planning stand-in and its run name the tests of other modules the `reason` changes, and the reading
  of "changed" — against which text a requirement counts as changed — is written here.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
