---
id: ITM-634
title: A split part is shown as it is written
level: module
realises:
  - UC-005
modules:
  - MOD-review-pages
builds_on:
  - ITM-578
tests:
  - unit
origin:
  - ITM-578's gate (docs/gates/20261017-0307-development-release-testing-7a2c.md)
---
# ITM-634 A split part is shown as it is written

**REGISTER**

## Outcome

UC-005 6a: "The author splits a flagged candidate. Each part becomes an entry of its own."

Two parts that change one requirement cannot both be written, because the second change replaces the first's block.
ITM-578 handles this in `editedResult` (`src/review-pages/candidates.mjs`): it writes such a part as `new`, with an
empty `of`. The panel still shows `change`, though, so what is written differs from what the person left, and the
person is not told.

This item makes the panel and the write agree:
- On *Split*, the second part of a `change` candidate shows the class `new` with an empty `of`. Every other class is
  copied as it is now.
- A part set to change what another part of the same candidate changes is refused before anything is written. The
  refusal is shown the way a duplicate name is.
- `editedResult` writes every part with the class and `of` the panel shows. The rewrite to `new` goes, together with its
  test's expectation of a silent rewrite.

## Acceptance

- After *Split* of a `change` candidate, the second part shows `new` with an empty `of`, and both parts are written as
  they are shown.
- Setting a part to change its candidate's `of` is refused, and nothing is written.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
