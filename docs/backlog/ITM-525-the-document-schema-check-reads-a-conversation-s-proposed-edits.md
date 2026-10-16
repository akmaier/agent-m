---
id: ITM-525
title: The document-schema check reads a conversation's proposed edits
level: module
realises:
  - UC-049
  - ONE DEFINITION, THREE DRIVERS
modules:
  - MOD-job-runner
builds_on:
tests:
  - unit
origin:
  - the gate of #556 (ITM-492, sprint team1/35), the developer's finding
  - MOD-job-runner, Data: the built-in check `document-schema` — "on every drafted document"
---
# ITM-525 The document-schema check reads a conversation's proposed edits

**REGISTER**

## Outcome

The built-in check `document-schema` judges every drafted document of a draft:
- the `files` of a kind that drafts documents;
- the `edits` of a conversation (`converse`), whose answer holds `answer` and `edits` and no `files`.

Today it reads `draft.files.flatMap(...)` (`src/job-runner/builtins.mjs`), so every answer of `converse` ends failed with
"Cannot read properties of undefined (reading 'flatMap')": the kind names the check, but its answer has no `files`. The
Bridge's test of ITM-492 had to answer with `files: []` to pass it.

What the module file leaves unstated, and what is built:
- **Which documents.** The check reads the documents of `files` and of `edits`, each `{ path, text }`.
- **A draft with neither.** A draft without `files` and without `edits` has no document to judge and no finding.

No existing test's expected result changes, release tests included. TST-472324
(`tests/job-runner-document-schema.test.mjs`) and the other tests of the check draft `files`, which are judged as
before.

## Acceptance

- A `converse` draft with an answer and no edits passes the check with no finding.
- A draft with one edit of a use case lacking its `## Postcondition` gets the finding the same file would get as a
  drafted file; a counter-proof that reads only `files` misses it.
- The first commit holds only the tests, and CI is red on it.
- Each test states its expected values in its own text (`A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT`); an
  existing test that the change turns red is not changed here: the Developer stops and names it.
- Only `src/job-runner/` and the tests that name MOD-job-runner change.
