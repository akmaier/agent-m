---
id: ITM-1180
title: The specification view carries no link "All SPEC change entries"
level: module
realises:
  - UC-020
modules:
  - MOD-trace-pages
builds_on:
tests:
  - unit
origin:
  - akmaier's answer of 2026-10-22 on the Requirements page: "Keep as specified."
---
# ITM-1180 The specification view carries no link "All SPEC change entries"

**REGISTER**

## Outcome

akmaier, on the Requirements page: "Keep as specified." UC-020 step 4 keeps the search and the filters.
- The view's links are stated in MOD-trace-pages' specification row (MOD-trace-pages.md:131):
  - first, only while an entry of a change queue waits, those entries, each with a link to it;
  - *Edit*, *+ Requirement* and *Arrange*;
  - *History of SPEC changes*.
- `src/trace-pages/flow.mjs:634` also draws "All SPEC change entries" to `#spec-entry` (ITM-878). No accepted text names
  that link, and it goes.
- `tests/trace-pages-waiting-changes.test.mjs:89-97` pins it, and changes with it.
- The page's look is team 1's ITM-1178.

## Acceptance

- At `main`, the view links *History of SPEC changes* and *Arrange*, and no "All SPEC change entries". The waiting entries
  stay linked while one waits.
- The test that pinned the link states its absence, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/trace-pages/` and the tests that name MOD-trace-pages change.
- **The function it needs:** none new. It removes one `reviewLink` call (`src/trace-pages/flow.mjs:631`).
- **The search for every count and expectation the Outcome changes was a run.** On `sprint/team1/116` at `b96d0ae8`, the
  link was taken out of `specChangeLinks`. The 67 test files that name `trace-pages`, `#spec`, `key: "spec"` or
  `spec-change-links` were run with and without that change.
  - Without it, 862 of 871 pass, with 0 failures.
  - With it, two more fail, both of MOD-trace-pages, and both change in the tests-only commit:
    - TST-878003 (`trace-pages-waiting-changes:89-97`), the link's text and address;
    - TST-360002 (`trace-pages-edit-links:110`), which counts ten anchors on the view and becomes nine.
- **Tests of other modules this Outcome changes: none**, by that run. The `#spec-entry` links that MOD-review-pages'
  tests count are the review pages' own.
- It removes no test.
