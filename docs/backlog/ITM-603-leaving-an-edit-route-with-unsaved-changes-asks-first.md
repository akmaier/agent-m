---
id: ITM-603
title: Leaving an edit route with unsaved changes asks first
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
# ITM-603 Leaving an edit route with unsaved changes asks first

**REGISTER**

## Outcome

UC-018 7a: "The dashboard asks before discarding them". MOD-markdown-render's `Editor.close()` asks (TST-343005), but no route calls it when the address changes.

## Acceptance

- Leaving an edit route with unsaved changes calls the editor's `close()`, which asks.
- When the person declines, the changes stay.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
