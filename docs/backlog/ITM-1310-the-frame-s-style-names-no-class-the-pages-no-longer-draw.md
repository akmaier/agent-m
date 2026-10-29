---
id: ITM-1310
title: The frame's style names no class the pages no longer draw
level: module
realises:
  - EVERY PAGE SHARES ONE LOOK AND WORKS ON A PHONE
modules:
  - MOD-site-frame
builds_on:
  - ITM-1180
tests:
  - unit
origin:
  - developer-sonnet-j's reading on ITM-1180 (PR #1446), and po-opus-c's gate, docs/gates/20261029-1202-development-release-testing-67b8.md
---
# ITM-1310 The frame's style names no class the pages no longer draw

**REGISTER**

## Outcome

ITM-1180 took the link "All SPEC change entries", of the class `spec-entries-link`, out of the specification view
(`src/trace-pages/flow.mjs`). The frame's style sheet still names that class among the requirements page's links
(`src/site-frame/look.css:76`). No page draws it any more: a search of `src/` and `tests/` for `spec-entries-link`
finds only that line.

After the change, `look.css:76` no longer names `spec-entries-link`, and the other classes of the rule stay.

## Acceptance

- Only `src/site-frame/look.css` changes, by that one class name.
- No expected result of any test changes, and CI is green on every commit (refactoring).
- Tests of other modules this Outcome changes: none. The search was every file under `src/` and `tests/` naming
  `spec-entries-link`, read to its end.
- It removes no test.
