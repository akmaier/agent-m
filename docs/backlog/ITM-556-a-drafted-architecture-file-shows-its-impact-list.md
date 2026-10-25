---
id: ITM-556
title: A drafted architecture file shows its impact list
level: module
realises:
  - UC-019
  - AN ARCHITECTURE CHANGE IS NOT ACCEPTED WITHOUT AN IMPACT LIST
modules:
  - MOD-review-pages
builds_on:
  - ITM-507
  - ITM-554
tests:
  - unit
origin:
  - ITM-507's gate (#602): its route `draft` shows an architecture file with its rounds and due diligence, but no impact list, since architectureImpact is not built
built_by:
  - 5ff0f100770b8c5e6e45e12034cd313b554e5a1c
---
# ITM-556 A drafted architecture file shows its impact list

**REGISTER**

## Outcome

On the route `draft`, an architecture file of the conversation's draft shows its impact list beside its rounds and its
due diligence, as MOD-review-pages states it ("an architecture file with its rounds, the due diligence and the impact
list of a change, as the descriptor's sections show them"). The list comes from MOD-trace-graph's `architectureImpact`
(ITM-554), built from the draft's files against the current ones, as `sections.mjs` already shows an architecture
change's impact list.

## Acceptance

- In a small DOM with a fixture draft of a module file, the route shows its impact list, a breaking use marked.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Each test states its expected values in its own text.

## Settled at sprint team2/89's start, 2026-10-18 (po-opus-b): done, built by ITM-729

Sprint 88's record names it built already (`docs/backlog/sprints/team2/88.md:84-85`). Its Acceptance, line by line, on
`main`:
- *"In a small DOM with a fixture draft of a module file, the route shows its impact list, a breaking use marked."* —
  TST-729003 (`tests/review-pages-impact-list.test.mjs:141-160`) keeps a `change-architecture` draft of a module file,
  draws `draft`, and asserts the `change-impact` section beside the due diligence, "MOD-tree-view breaks — uses an
  interface that is removed" first, one `breaks` mark, and the same list as on `module/<id>`. The code:
  `src/review-pages/conversation-draft.mjs:55-69`. `node --test tests/review-pages-impact-list.test.mjs`: 3 of 3 pass.
- *"The first commit holds only the tests, and CI is red on it."* — `373e412e` adds only that test file; gate record
  `docs/gates/20261018-0149-development-release-testing-8c02.md`: red in run 39087329438 on exactly TST-729003.
- *"Each test states its expected values in its own text."* — the literals stand in the test file (`MODULE_LIST`,
  `MODULE_LINES`).

So the item is done with ITM-729 (#834, merged with team 2's sprint 86). A file the draft adds gets no impact list on
`draft` (`conversation-draft.mjs:61-62`, noted in the same gate record). Its Acceptance does not ask for that.
