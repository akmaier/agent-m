---
id: ITM-1366
title: The document check finds a title line that differs from its schema
level: module
realises:
  - EVERY ARTIFACT HAS AN IDENTIFIER
  - UC-004
modules:
  - MOD-documents
builds_on:
  - ITM-1363
tests:
  - unit
origin:
  - developer-opus-f's probe of ITM-1363 (#1648), ruled by the Product Owner of team1's sprint 141
---
# ITM-1366 The document check finds a title line that differs from its schema

**REGISTER**

## Outcome

MOD-documents' `documentFindings` gives "every finding the schema can decide", the title among them
(MOD-documents.md:276-284), against the schema's `title` pattern, for example `# {id} {title}` (MOD-documents.md:70).
`src/documents/checks.mjs:16-18` states that the title is "not checked yet". So a source entry whose title line is a bare `#` has
no finding.

## Acceptance

- `documentFindings` reports a document whose title line does not fit its schema's `title` pattern, or that lacks the
  title line the pattern asks for, as an error at the title's line, naming the rule of the part of the schema closest to
  it. A title line that fits gives no finding, and a schema without `title` gives none.
- Before the job starts, its probe runs the existing tests that read the repository's documents through
  `documentFindings`, and names every document that would gain a finding. One whose fix the accepted texts allow is fixed
  under this item; any other stops the item for the Product Owner.
- No other existing expected result changes, unless a probe names it and the accepted text allows it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
