---
id: ITM-809
title: The progress facts name the default branch's results and the instance
level: module
realises:
  - UC-046
modules:
  - MOD-progress-measures
  - MOD-main-page
builds_on:
  - ITM-685
tests:
  - unit
origin:
  - ITM-685's gate on pull request #742 (sprint team1/74), from developer-sonnet-e's readings 1 to 4
---
# ITM-809 The progress facts name the default branch's results and the instance

**REGISTER**

## Outcome

MOD-progress-measures' text asks for three things that its interface cannot give as stated:
- **The Tests stage.** "A test passes by the newest result record of a commit of the default branch that ran it". `Facts`
  holds the default branch's snapshot and the results branch, but not which commits belong to the default branch. So
  `stageShares(facts)` cannot find a test's newest record of such a commit. ITM-685 gives the stage no share and names
  the missing fact.
- **The instance's own bar.** "For the instance's own repository, which has no product, the same bar for Agent M, full
  once its first release is tagged". Nothing in `Facts` tells the instance's repository from a product's.
- **The types.**
  - `stageShares` reads the results branch, so it returns a `Promise`; the text types it without one.
  - `currentStage` has no stage to name when every stage is full; the text types it as `string`.

Each needs a change of `docs/architecture/MOD-progress-measures.md`, so a draft for akmaier is written first. For
example: a `Facts` field with the default branch's commits, or whether `Facts` is the instance's own; `Promise<…>`; and
`string | null`. After its acceptance this item builds it.

## Acceptance

- The accepted draft's fields are built, and the Tests stage and the instance's bar follow the text, with tests.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**MOD-main-page joins its modules (sprint team2/98, po-opus-b, at #1236's second gate).**
- The Tests stage this item builds shows on the main page's card. TST-827002 (`tests/main-page-home.test.mjs`, which names
  MOD-main-page) pins the card's Tests stage as unknown.
- `AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES` (SPEC.md:1442-1445) admits only "tests that name one of those modules".
  So the item names MOD-main-page, for that test alone. No code of MOD-main-page changes.
- `conflicts` finds MOD-main-page held by no item of team 1.

