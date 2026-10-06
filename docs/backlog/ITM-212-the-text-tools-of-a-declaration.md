---
id: ITM-212
title: The text tools of a declaration
level: module
realises:
  - UC-002
  - A FINDING READS LIKE A COMPILER MESSAGE
modules:
  - MOD-text-tools
builds_on:
tests:
  - unit
origin:
  - UC-002
---
# ITM-212 The text tools of a declaration

**REGISTER**

## Outcome

MOD-text-tools' interface, as its file states it, for what UC-002's modules need, in `src/text-tools/`:

- `FrontMatter`, `parseFrontMatter` and `formatFrontMatter`, with `parseFrontMatter` of `docs/assets/artifacts.mjs` as a
  model where it does the same;
- `Finding`, `finding`, `formatFinding` and `parseFinding`;
- `blobSha`;
- `HistoryMark` and `historyMarks`, which MOD-documents' `documentFindings` uses for a schema with `noHistory` (ITM-213);
- `DiffLine` and `lineDiff`, on which MOD-markdown-render's editor and its difference rest; MOD-site-frame's `schemaForm`
  edits a section of UC-002's form in that editor.

`sha256` is not part of this item.

## Acceptance

- Unit tests that name MOD-text-tools state, before the code exists:
  - what each function does with a text that has front matter, one that has none and one whose front matter is broken;
  - a finding written in its one text form and read back unchanged;
  - git's blob SHA of a text, checked against the SHA git itself gives for the same bytes;
  - the marks `historyMarks` finds — a note that something was withdrawn, a stamp of who edited what or when, a date
    given as the date of a change —, each with its line and its kind, and none in a text without them;
  - `lineDiff` giving every line of both texts in order, each `same`, `added` or `removed` with its line before and
    after, with as few added and removed lines as the two texts allow, and no difference for a text that changed only
    its line endings.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/text-tools/` and the tests that name MOD-text-tools change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
