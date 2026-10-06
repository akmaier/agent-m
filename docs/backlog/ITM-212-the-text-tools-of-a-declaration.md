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

MOD-text-tools' interface, as its file states it, for what UC-002's modules need: `FrontMatter`, `parseFrontMatter`
and `formatFrontMatter`; `Finding`, `finding`, `formatFinding` and `parseFinding`; and `blobSha`, in `src/text-tools/`,
with `parseFrontMatter` of `docs/assets/artifacts.mjs` as a model where it does the same. `lineDiff` and `historyMarks`
are not part of this item.

## Acceptance

- Unit tests that name MOD-text-tools state, before the code exists, what each function does with a text that has front matter, one that has none and one whose front matter
is broken; a finding written in its one text form and read back unchanged; and git's blob SHA of a text, checked against
the SHA git itself gives for the same bytes.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/text-tools/` and the tests that name MOD-text-tools change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
