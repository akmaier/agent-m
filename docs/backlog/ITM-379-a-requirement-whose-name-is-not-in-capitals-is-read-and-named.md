---
id: ITM-379
title: A requirement whose name is not in capitals is read and named
level: module
realises:
  - UC-005
  - UC-019
  - EVERY ARTIFACT HAS AN IDENTIFIER
  - A REQUIREMENT HAS FOUR FIELDS
modules:
  - MOD-spec-document
builds_on:
  - ITM-301
tests:
  - unit
origin:
  - UC-005 step 6
  - UC-019 step 7
---
# ITM-379 A requirement whose name is not in capitals is read and named

**REGISTER**

## Outcome

MOD-spec-document, as its file states it: `parseSpec` reads a head line of the requirement's form whose name is not in
capitals as a requirement too, and `requirementFindings` gives it an error under `EVERY ARTIFACT HAS AN IDENTIFIER`,
naming the requirement and its line, because MOD-identifiers' `kindOfIdentifier` does not read it as a requirement's
name. The check `requirement-form` then judges a drafted candidate under such a name instead of passing over it.

## Acceptance

- Unit tests that name MOD-spec-document state, before the code exists: a head line `**Export is a pdf**` read as a
  requirement and named in an error; a name in capitals passing; the SPEC's own head lines reading as before.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/spec-document/` and the tests that name MOD-spec-document change.
