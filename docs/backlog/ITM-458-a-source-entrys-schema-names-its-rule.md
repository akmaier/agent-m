---
id: ITM-458
title: A source entry's schema names its rule
level: module
realises:
  - UC-004
  - THE INSTANCE KEEPS THE SOURCE REGISTER
modules:
  - MOD-source-register
builds_on:
  - ITM-314
tests:
  - unit
origin:
  - ITM-350, #431
  - MOD-documents, the schema language: `rule`, "every schema names one"
---
# ITM-458 A source entry's schema names its rule

**REGISTER**

## Outcome

MOD-source-register's `source.schema.md`, the schema of a register entry, names its `rule`, as MOD-documents' schema
language asks of every schema: `THE INSTANCE KEEPS THE SOURCE REGISTER`, the requirement the format applies. A finding
of an entry then names that rule where no part of the schema names its own, so that MOD-documents' `documentFindings`
and the frame's `schemaForm` give the findings of an entry with an error instead of throwing. The library page builds
its form with `schemaForm` (ITM-350).

## Acceptance

- Unit tests that name MOD-source-register state, before the change: an entry missing a required field, read with
  `documentFindings` against `sourceSchemas().entry`, gives a finding that names `THE INSTANCE KEEPS THE SOURCE
  REGISTER`, and no error is thrown; a valid entry gives no finding.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/source-register/` and the tests that name MOD-source-register change.
