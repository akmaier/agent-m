---
id: ITM-724
title: The whole architecture as a recipe, and what a change of it rests on
level: module
realises:
  - UC-023
  - THE ARCHITECTURE'S PARTICIPANTS RECEIVE THE WHOLE PROJECT
  - NOTHING IS LEFT OUT OF AN ARCHITECTURE PROMPT SILENTLY
  - ARCHITECTURE IS DESIGNED ONLY AGAINST ACCEPTED USE CASES
  - NOTHING IS IMPLEMENTED BEFORE IT IS ACCEPTED
modules:
  - MOD-approvals
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-724 The whole architecture as a recipe, and what a change of it rests on

**REGISTER**

## Outcome

UC-023 step 2 sends a described change "with the entire project — the whole SPEC, every use case and the whole
architecture". The kind `change-architecture` names the recipe `whole-architecture` and the precondition
`rests-on-accepted`. MOD-approvals states both (`docs/architecture/MOD-approvals.md`, `approvalStrategies`);
`src/approvals/strategies.mjs:4` says "the recipe `whole-architecture` and the architecture's part of
`rests-on-accepted` are not built yet".

This item builds them as the file states them:
- recipe `whole-architecture`: every architecture decision and module file, one part per file, carrying its file as an
  artifact keyed by the key of its format;
- `rests-on-accepted`, where the parameters ask for it: an error finding naming every file of the architecture that is not
  accepted, beside the requirements and use cases it names today.

## Acceptance

- With a fixture snapshot: every ARC and MOD file as one part each, none left out; `prepareJob` of
  `change-architecture` finds every strategy it names.
- `rests-on-accepted` names an open and a changed architecture file when asked, and nothing of the architecture when not
  asked; the existing findings for requirements and use cases stay as they are.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
