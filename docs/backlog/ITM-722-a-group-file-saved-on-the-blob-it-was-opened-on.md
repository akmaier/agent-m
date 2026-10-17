---
id: ITM-722
title: A group file is saved on the blob it was opened on
level: module
realises:
  - UC-021
  - A REGROUPING IS COMMITTED DIRECTLY
  - REGROUPING LEAVES THE GROUPED FILE UNCHANGED
  - A SAVE IS REFUSED WHEN THE TEXT CHANGED MEANWHILE
  - AN ITEM HAS ONE PLACE IN ITS HIERARCHY
modules:
  - MOD-artifact-edits
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
---
# ITM-722 A group file is saved on the blob it was opened on

**REGISTER**

## Outcome

UC-021 step 5 commits `docs/groups/<kind>.md` and nothing else. MOD-artifact-edits states `saveGroupFile` for it
(`docs/architecture/MOD-artifact-edits.md`, Interfaces) and does not build it: `src/artifact-edits/index.mjs` exports
`saveFile`, `keptIdentifier`, `fallbackEditLinks`, `reviewLayoutCommit` and `editStrategies` only.

This item builds `saveGroupFile(host, { kind, text, openedBlob })` as the file states it:
- the group file of the kind, and no other file, in one commit on the default branch, under the token the host was
  connected with;
- refused with `changed meanwhile` and the newer text when the blob is no longer `openedBlob`; `null` creates the file
  only while it does not exist (UC-021 1a);
- refused with `not one place` and the items while an item stands in more than one place, read with
  MOD-group-document's `parseGroupFile` and `hierarchy`, as the module's Uses name them;
- the errors of `saveFile`.

## Acceptance

- Against a fixture host: a new group file created; an existing one saved on its blob, with no other path in the commit;
  a changed blob refused with the newer text and nothing written; a member placed twice refused with its items.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
