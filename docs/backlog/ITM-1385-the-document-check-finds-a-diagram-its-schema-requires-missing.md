---
id: ITM-1385
title: The document check finds a diagram its schema requires missing
level: module
realises:
  - DIAGRAMS ARE MERMAID IN MARKDOWN
  - UC-007
modules:
  - MOD-documents
builds_on:
  - ITM-580
tests:
  - unit
origin:
  - finding UC007-F2 of ITM-580's release test TST-580305 (#1672), ruled at its gate in team1's sprint 142 (docs/gates/20261101-1459-development-release-testing-0580.md)
---
# ITM-1385 The document check finds a diagram its schema requires missing

**REGISTER**

## Outcome

MOD-documents' `documentFindings` gives "a diagram missing where `required`" (MOD-documents.md:276-284), and the use-case
schema requires one (MOD-documents.md:230-232). `src/documents/checks.mjs:16-17` states that "a Mermaid block missing where
`diagrams` is `required` or standing where it is `none`" is "not checked yet". So a drafted use case without Mermaid passes
the correction loop.

## Acceptance

- `documentFindings` reports, as an error, a document whose schema names `diagrams: required` and that holds no Mermaid
  block, and one whose schema names `diagrams: none` and that holds one. A document that fits gives none.
- Before the job starts, its probe runs the existing tests that read the repository's documents through
  `documentFindings` and names every document that would gain a finding. One whose fix the accepted texts allow is fixed
  under this item; an accepted use case or architecture file that would change stops the item for the Product Owner.
- TST-580305 loses its `todo` in a commit by a participant other than the implementer, written after the code is pushed.
- No other existing expected result changes, unless a probe names it and the accepted text allows it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
