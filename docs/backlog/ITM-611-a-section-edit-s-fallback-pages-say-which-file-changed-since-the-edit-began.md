---
id: ITM-611
title: A section edit's fallback pages say which file changed since the edit began
level: module
realises:
  - UC-018
  - WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
modules:
  - MOD-spec-changes
builds_on:
  - ITM-592
tests:
  - unit
origin:
  - ITM-592's gate (docs/gates/20261016-2309-development-release-testing-df68.md): `proposeSection` computes `existing` from the snapshot it compares against, so `differs` is always false
---
# ITM-611 A section edit's fallback pages say which file changed since the edit began

**REGISTER**

## Outcome

Without a token, `proposeSection` and `saveEntry` return `fallbackEditLinks` for the entry's files. Each file's
`existing` is taken from the snapshot read at the save (`src/spec-changes/propose.mjs:386-388` and `:422-424`), which is
also the snapshot `fallbackEditLinks` compares against. So `differs` is always false, and UC-018 4a's "warns if one
already differs" never shows.

`existing` is to say whether the file existed when the edit began, as MOD-artifact-edits defines `differs`: "the file on
the default branch is no longer what the edit started from".

**Not ready for a sprint yet.** Before its start, it is read from MOD-spec-changes' interface where the edit's beginning
comes from. The change already carries `openedBlob`, the blob of the section that was opened. A queue's files that did
not exist then may need the head that was read when the edit opened.

## Acceptance

- A file of the entry that appeared or disappeared on the default branch since the edit began is marked as differing.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
