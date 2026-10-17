---
id: ITM-780
title: What a new version of the declared model changes is shown before it is declared
level: module
realises:
  - UC-031
  - A MODEL DEFINITION IS VALIDATED BEFORE IT IS USED
modules:
  - MOD-implementation-pages
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-780 What a new version of the declared model changes is shown before it is declared

**REGISTER**

## Outcome

UC-031 6a. The route `process` leaves out the comparison of two versions of the declared model
(`src/implementation-pages/process.mjs:28`; ITM-222 excludes it). When the catalogue as it stands holds another
`version` of the declared model than the commit the declaration names, the route shows, before *Save* names the new
commit, as the module's file states it:
- the phases, gates and roles of `workflowOf` under each version, side by side;
- the difference of the two model files, with `showDifference`;
- what becomes invalid: `declarationFindings` against the catalogue as it stands, and `roleAssignmentFindings` for
  the role assignments against that version's workflow.

Until the author saves, the product keeps the version it declared.

## Acceptance

- With a fixture instance whose declared model changed after the declaration's commit, the route shows both workflows,
  the difference and the findings; with an unchanged model it shows none of them.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
