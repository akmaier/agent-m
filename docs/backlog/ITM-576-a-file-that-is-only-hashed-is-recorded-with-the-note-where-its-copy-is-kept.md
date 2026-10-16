---
id: ITM-576
title: A file that is only hashed is recorded with the note where its copy is kept
level: module
realises:
  - UC-004
modules:
  - MOD-source-register
  - MOD-settings-pages
builds_on:
  - ITM-455
tests:
  - unit
  - system
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), at akmaier's request of 2026-10-16
---
# ITM-576 A file that is only hashed is recorded with the note where its copy is kept

**REGISTER**

## Outcome

UC-004 4a: "only designation and hash are recorded, with a note where the copy is kept". Hash-only registration is built (ITM-455), but the note has no field. MOD-source-register, Data, `## Versions`: "or a note where a copy that was only hashed is kept".

## Acceptance

- The library form asks for the note when a file is only hashed, and the register entry holds it.
- A hash-only file without a note is refused by name.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
