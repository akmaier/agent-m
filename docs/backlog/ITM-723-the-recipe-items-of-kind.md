---
id: ITM-723
title: The recipe items-of-kind
level: module
realises:
  - UC-021
  - ARTIFACTS ARE ARRANGED IN NESTED GROUPS
  - THE PAGE NAMES WHERE IT SENDS
modules:
  - MOD-artifact-edits
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-723 The recipe items-of-kind

**REGISTER**

## Outcome

UC-021 1b sends a participant "titles and identifiers of the items, with their text for requirements". The kind
`propose-groups` names the recipe `items-of-kind` (MOD-job-catalogue's table), which MOD-artifact-edits'
`editStrategies` states and does not build (`src/artifact-edits/strategies.mjs:2`: "the recipe `items-of-kind` (UC-021)
is not built yet").

This item builds it as the file states it: the title and identifier of every item of the kind the job's parameters name,
the whole text of each requirement when the kind is requirements, and the current group file. The check `group-rules`
(ITM-388) and the kind's data files (ITM-396) are built.

## Acceptance

- With a fixture snapshot, for each of the five kinds: every item with its title and identifier, a requirement with its
  text, and the group file as it stands — none when the product has none.
- `prepareJob` of `propose-groups` finds the recipe, with no strategy missing.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
