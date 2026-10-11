---
id: ITM-302
title: A SPEC section's exact bytes, its replacement, and the names it holds
level: module
realises:
  - UC-006
  - UC-018
  - THE APPROVED TEXT IS TAKEN VERBATIM
  - NO PROPOSAL WITHOUT THE CURRENT TEXT BESIDE IT
  - A RENAMED REQUIREMENT IS WITHDRAWN AND ADDED
modules:
  - MOD-spec-document
builds_on:
  - ITM-214
tests:
  - unit
origin:
  - UC-006 steps 2 and 6
  - UC-018 steps 2 and 6, 3a
---
# ITM-302 A SPEC section's exact bytes, its replacement, and the names it holds

**REGISTER**

## Outcome

MOD-spec-document's `sectionText`, `replaceSection`, `requirementNamesIn` and `renamedRequirements`, as its file states
them, in `src/spec-document/` beside `parseSpec`: the exact bytes of the section a heading line starts; the SPEC with
that section replaced byte for byte and every other byte unchanged, a new heading placed after the section the caller
names, `SectionNotFound` otherwise; the requirement names a text holds as head lines, in order; and, for two versions of
a section, the names withdrawn and the names added. MOD-spec-changes (ITM-339, ITM-340, ITM-341, ITM-338) and the
requirement editor (ITM-359) call them. `extractSection`, `sectionText` and `replaceSection` in
`docs/assets/review-core.mjs` are the model and stay as they are. `requirementFindings` is not part of this item.

## Acceptance

- Unit tests that name MOD-spec-document state, before the code exists, on fixture SPEC texts: a section's bytes
  returned exactly — a CR and trailing spaces kept — and `null` for a heading the text lacks; a replacement that
  changes only that section's bytes, the last section and a new section included, and `SectionNotFound` where neither
  fits; a section's names in order; a rename read as one name withdrawn and one added, a changed rule as neither.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/spec-document/` and the tests that name MOD-spec-document change.
