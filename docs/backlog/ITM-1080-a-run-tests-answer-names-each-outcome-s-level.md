---
id: ITM-1080
title: A run-tests answer names each outcome's level
level: module
realises:
  - UC-013
  - UC-028
modules:
  - MOD-job-catalogue
builds_on:
  - ITM-586
tests:
  - unit
origin:
  - the gate of #1073 (ITM-586), sprint team2/96, on main at 309c8ee7
---
# ITM-1080 A run-tests answer names each outcome's level

**REGISTER**

## Outcome

MOD-result-records.md:83-84: the record's `## Outcomes` has the columns `Test`, `Level`, `Outcome` and `Runs`, so the writer
`result-record` refuses an outcome without a level (`OutcomeWithoutLevel`, ITM-586). The kind's answer schema
(`src/job-catalogue/kinds/run-tests/answer.schema.json:25-28`) requires only `test` and `outcome`. So a participant can
give an answer that the schema accepts and the writer refuses.

## Acceptance

- The answer schema of `run-tests` requires `level` for each outcome. A unit test naming MOD-job-catalogue shows an answer
  without it refused by the schema's check, with the field named.
- Counter-proof: the old schema accepts that answer.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/job-catalogue/kinds/run-tests/` and the tests that name MOD-job-catalogue change.
