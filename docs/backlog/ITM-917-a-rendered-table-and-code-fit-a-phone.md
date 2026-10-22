---
id: ITM-917
title: A rendered table and a code run fit a phone
level: module
realises:
  - EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
modules:
  - MOD-markdown-render
  - MOD-site-frame
builds_on:
  - ITM-904
tests:
  - unit
  - system
origin:
  - ITM-904's findings (sprint team1/89), `tests/site-usability.test.mjs`
---
# ITM-917 A rendered table and a code run fit a phone

**REGISTER**

## Outcome

ITM-904's check finds, at a phone's width, that on `#uc/UC-001` a Markdown table and a code run are wider than the window.
Both are drawn by MOD-markdown-render's `renderArtifact`. Its todo stands in `tests/site-usability.test.mjs`.

## Scope and readiness

The review entry already loads MOD-site-frame's `look.css`. The accepted Frame owns the shared look and the takeover of
needed legacy style rules; the accepted renderer owns `renderArtifact`'s markup. Reflow can use these existing owners
without a new public interface or a formal-text change. Change only the renderer markup and shared Frame styles needed
for the rendered Markdown table and code on `#uc/UC-001` and `#review/uc`. Do not edit unowned legacy CSS in place.
Any shared Frame writer is serialized with this item, including its tests and counter-proofs.

## Acceptance

- At 390 px, the rendered Markdown table and code run on `#uc/UC-001` and `#review/uc` fit without sideways scrolling.
  At 1280 px they remain readable. Preserve the text, table cells and their column meaning; clipping, hiding content or
  a sideways-scrolling wrapper is not reflow. Use the accepted Frame's table-label convention where applicable.
- Preserve the renderer's existing unit expectations except the exact table-label alignment below, sanitization,
  embedded-resource handling, Mermaid rendering and failure-source behavior. Add focused verification at the affected
  renderer and live browser failure nodes, with new
  unused native test identifiers and their actual unit or system level; a browser case is not a unit test.
- The sole old unit expected-markup exception is TST-472393 in `tests/markdown-render.test.mjs`, the case
  `renderArtifact — headings, lists, emphasis, links, tables and code are rendered`: in its `expected.table` pattern,
  require literal `<td data-label="Role">Scrum Master</td>` and
  `<td data-label="Who may hold it">a person or an agent</td>` instead of those two bare `<td>` tags. Retain the entire
  table pattern, its headings, row, cell text and whitespace matching; do not replace attributes or content with a
  wildcard. Retain every other expected pattern, EXPLANATION input, assertion, TST identifier and unit level. Only the
  case's matching expectation prose may be aligned with these two attributes. No helper, fixture or other old
  expected-result change is authorized. This maintenance needs no replay of the existing tests-only first red or new
  test/counter-proof quota; the new cases' existing obligations remain.
- In `tests/site-usability.test.mjs`, retain TST-904042 and TST-904045, their system level, routes, both widths, literal
  unfiltered `[]` expectations, geometry collector and planted controls. Remove only the resolved width TODO reasons for
  `#uc/UC-001` and `#review/uc` after the actual checks pass. No other old expected-result change is authorized. Preserve all
  unrelated TODOs, helpers, fixtures, IDs and levels, and the frozen TST-922001 body in `tests/site-accessibility.test.mjs`.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
