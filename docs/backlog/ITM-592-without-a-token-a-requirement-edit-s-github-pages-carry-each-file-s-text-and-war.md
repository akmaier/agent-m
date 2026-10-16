---
id: ITM-592
title: Without a token, a requirement edit's GitHub pages carry each file's text and warn when one differs
level: module
realises:
  - UC-018
modules:
  - MOD-review-pages
builds_on:
tests:
  - unit
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-592 Without a token, a requirement edit's GitHub pages carry each file's text and warn when one differs

**REGISTER**

## Outcome

UC-018 4a for a requirement: "each with its text on the clipboard … warns if one already differs". `proposeSection` returns `text` and `differs` (TST-472992), but `src/review-pages/edit.mjs:94-98` shows only the links.

## Acceptance

- Each page's text can be copied, and a file that already differs is warned about, as on the use-case path.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
