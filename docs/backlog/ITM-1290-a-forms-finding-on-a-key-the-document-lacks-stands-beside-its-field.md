---
id: ITM-1290
title: A form's finding on a key the document lacks stands beside its field
level: module
realises:
  - A FINDING READS LIKE A COMPILER MESSAGE
modules:
  - MOD-site-frame
builds_on:
  - ITM-1257
tests:
  - unit
origin:
  - po-opus-c's gate of ITM-1257 (PR #1392), docs/gates/20261029-0247-development-release-testing-4142.md, reading 2
---
# ITM-1290 A form's finding on a key the document lacks stands beside its field

**REGISTER**

## Outcome

MOD-site-frame.md:270-271 says `schemaForm` shows the findings of `documentFindings` and of `extraChecks` "beside their
fields while typing". A finding on a key the document lacks — a required field emptied, so the key is left out — is
shown at the end of the form (the header of `src/site-frame/forms.mjs`; TST-1257002). The form has a field for every key
of its schema, so that finding too stands beside the field of its key.

## Acceptance

- A unit case empties a required list field and a required text field, and finds each "required" finding beside its
  field; it fails on the form as it stands. A finding on a key the schema does not know stays at the form's end.
- Only `src/site-frame/` and its tests change.
