---
id: ITM-227
title: The findings a schema decides, each naming its requirement
level: module
realises:
  - UC-002
  - A FINDING READS LIKE A COMPILER MESSAGE
modules:
  - MOD-documents
builds_on:
  - ITM-213
tests:
  - unit
origin:
  - UC-002
---
# ITM-227 The findings a schema decides, each naming its requirement

**REGISTER**

## Outcome

MOD-documents' `documentFindings` and the `rule` of its schema language, as the module's accepted file states them, in
`src/documents/`, built to what MOD-model-catalogue (ITM-215), MOD-participant-list (ITM-216) and MOD-product-process
(ITM-218) call:
- `loadSchema` reads the `rule` a schema, a section, a value specification, a condition or a variant names, and refuses
  with `SchemaError` a `rule` that is not a requirement's name in capitals.
- `documentFindings` finds:
  - front matter keys missing — also where a `requiredWhen` condition holds —, unknown, out of order, or present where a
    `forbiddenWhen` condition holds;
  - values that do not fit their type or the variant that holds, or are empty where `nonEmpty`;
  - each row of a table, cell by cell, in the same way;
  - required sections missing, sections out of order, and sections the schema forbids.
- Each finding is an error with its line, made with MOD-text-tools' `finding`. It names the rule of the part of the
  schema closest to it, in the order the file gives (Data, *The requirement a finding names*): a condition's, the
  variant's, the value specification's, the section's, and last the schema's own.

Not part of this item: the path and the identifier against the path, a path pattern's own rule and a condition on the
path, the title, `describedIn`, diagrams and images, the marks of history, a schema refused for naming no rule,
`underTitle`, a section's table found by its header, appended sections, `appendSection`, `classifyCandidates`,
`artifactSchemas` and the module's own schemas.

## Acceptance

- Unit tests that name MOD-documents state, before the code exists, on fixture schemas and documents:
  - each kind of finding above, with its line, in the one text form of a finding;
  - the requirement each finding names, in the file's order — a condition's rule; the variant's, then the value
    specification's; the section's; the schema's own —, each case stated with the closer rule present and absent;
  - a schema's `rule` and the rules of its parts read by `loadSchema`, and a `rule` that is not a requirement's name in
    capitals refused with `SchemaError`.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/documents/` and the tests that name MOD-documents change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS MODULES`).
