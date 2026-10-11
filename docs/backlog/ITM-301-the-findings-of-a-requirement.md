---
id: ITM-301
title: The findings of a requirement
level: module
realises:
  - UC-005
  - UC-018
  - UC-019
  - A REQUIREMENT HAS FOUR FIELDS
  - A REQUIREMENT NAMES ITS CHECK
  - ONE STATEMENT PER REQUIREMENT
  - THE NAME IS THE ID AND IT SURVIVES
  - A DOCUMENT HOLDS NO HISTORY
modules:
  - MOD-spec-document
builds_on:
  - ITM-214
tests:
  - unit
origin:
  - UC-005 step 6
  - UC-018 step 3
---
# ITM-301 The findings of a requirement

**REGISTER**

## Outcome

MOD-spec-document's `requirementFindings(spec)`, as its file states it, in its part `checks.mjs`: an error for a missing
source, rule or check; an error for a check that names neither a test nor review; a warning for a rule with "and" or
"additionally"; an error for a name given twice; an error for each mark of history — each naming the requirement and its
line. The check `requirement-form` (ITM-329) and the requirement editor (ITM-359) call it. `sectionText`,
`replaceSection`, `requirementNamesIn` and `renamedRequirements` are not part of this item.

## Acceptance

- Unit tests that name MOD-spec-document state, before the code exists, one per finding and one for a requirement with
  none.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/spec-document/` and the tests that name MOD-spec-document change.
