---
id: ITM-516
title: A hold ends when the item's change is on the default branch
level: module
realises:
  - A SPRINT HOLDS ITS ITEMS UNTIL THEY REACH THE DEFAULT BRANCH
  - SPRINTS OF DIFFERENT TEAMS CHANGE NO MODULE THE OTHER CHANGES OR USES
  - UC-032
modules:
  - MOD-work-plans
builds_on:
tests:
  - unit
origin:
  - docs/backlog/sprints/team1/28.md
---
# ITM-516 A hold ends when the item's change is on the default branch

**REGISTER**

## Outcome

MOD-work-plans' `heldItems` takes `onDefault`, and `undecidedHeads` is added, as the module file accepted at blob
`1db24f7303e4` states them:
- **An item's hold ends** when a merged pull request naming it reaches the default branch through the pull requests that
  merge its base on, or when that pull request's head commit is in `onDefault`.
- **`undecidedHeads`** names the head commits a caller must ask the host's `containsCommit` about first.

Today `heldItems` releases an item only through a chain of merged pull requests (`reachesDefaultBranch` in
`src/work-plans/sprints.mjs`). ITM-291's pull requests #279 and #285 were merged into `sprint/19`, which no pull request
merged into `main`, while the change reached `main` by another way. So `heldItems` on `main` reports ITM-290, ITM-291,
ITM-295 and ITM-297 as held by Team 2's closed sprints 19 and 24.

What the module file leaves unstated, and what is built:
- **The default branch of the chain.** It is `main`. The fifth parameter is `onDefault`, a set of head commits; the
  options object `{ defaultBranch }`, which the accepted file does not name, is removed. A repository whose default
  branch has another name is decided through `onDefault`.
- **`undecidedHeads(sprints, pullRequests)`.** It gives the `head` of every merged pull request that names an item which
  `heldItems(sprints, [], [], pullRequests)` holds and whose chain reaches no `main`. The heads come in the order of the
  pull requests, each once.

The existing test whose expected result the accepted texts change, named here:

- TST-469001 (`tests/work-plans-sprints.test.mjs`). Its last case passes `{ defaultBranch: "trunk" }`. It passes
  instead `onDefault` holding the head commit of #283, with the same expectation: not held.

No release test calls `heldItems` with a fifth argument; `tests/parallel_sprints_fixture.py` calls it with four.

## Acceptance

- An item whose merged pull request's head commit is in `onDefault` is not held, whether or not a chain of pull requests
  leads to `main`. An item whose change is in neither stays held as before.
- `undecidedHeads` names exactly the heads of such pull requests: none for a chain that reaches `main`, and none for an
  item no sprint holds.
- A regression test uses the pull requests of ITM-291 as its fixture — merged into `sprint/19`, with their head commits in
  `onDefault` — and is written and seen failing first, with its planted-fault counter-proof. The case of a change not on
  the default branch stays held.
- Each test states its expected values in its own text (`A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT`). An
  existing test that the change turns red, other than TST-469001, is not changed here: the Developer stops and names it.
- Only `src/work-plans/` and the tests that name MOD-work-plans change.

## Intake Decision

Registered by scrum-master-opus on akmaier's direction to mend the gaps of Sprint 28's start decision. The change of
MOD-work-plans' module file it needs is accepted (`83312204`).
