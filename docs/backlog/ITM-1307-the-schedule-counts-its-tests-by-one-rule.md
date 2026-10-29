---
id: ITM-1307
title: The schedule counts its tests by one rule
level: module
realises:
  - DON'T REPEAT YOURSELF
  - UC-027
modules:
  - MOD-test-pages
builds_on:
  - ITM-1265
tests:
  - unit
origin:
  - developer-opus-e's point on ITM-1265 (PR #1422), and po-opus-c's gate, docs/gates/20261029-0909-development-release-testing-7058.md
---
# ITM-1307 The schedule counts its tests by one rule

**REGISTER**

## Outcome

The rule by which a schedule row counts the tests is stated and built twice: each level counts the declarations of that
level, and the row `paid` counts those that call a paid service.
- **MOD-progress-measures** builds `scheduleView(facts)` from it (MOD-progress-measures.md:297-303,
  `src/progress-measures/views.mjs`). `publishOverview` stores the result.
- **MOD-test-pages** keeps its own copy. Where the repository stores no view, the route `schedule` counts the test files
  itself (MOD-test-pages.md:120-123, `testCounts` in `src/test-pages/schedule.mjs`).

The two copies already differ. The route adds to `paid` a declaration whose level is written `paid`. `scheduleView`
counts it in no row.

So one function should give the counts, and the route should call it where no view is stored. That function is
`scheduleView`, given the declarations the route reads. MOD-test-pages' Uses name `MOD-progress-measures.storedView`
(MOD-test-pages.md:36) and not `scheduleView`. A MODULE INTERFACE IS MINIMAL, and the Uses of each module bound what it
may call.

## Not ready: a draft for akmaier

This item is built once akmaier accepts a draft of MOD-test-pages.md that does two things:
- names `MOD-progress-measures.scheduleView` among its Uses;
- says that, where no view is stored, the route counts the test files with it.

The draft also says which argument `scheduleView` is given there, since its interface takes `Facts` (MOD-progress-measures.md:301).

## Acceptance

- Once the draft is accepted, a unit test of MOD-test-pages: where no view is stored, the route's counts equal
  `scheduleView`'s for the same declarations, one of them of the level `paid`. Its counter-proof is the route's own
  counting as it stands, which counts that declaration under `paid`.
- The first commit holds only the tests, and CI is red on it.
- Only `src/test-pages/` and the tests that name MOD-test-pages change.
- Tests of other modules this Outcome changes: none known; to be named before selection.
