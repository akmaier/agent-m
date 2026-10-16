---
id: ITM-490
title: A job record says that its task travels with its hand-over
level: module
realises:
  - UC-049
  - A JOB IS RECORDED IN ITS PRODUCT REPOSITORY
  - A CONVERSATION IS WRITTEN TO A REPOSITORY ONLY WHEN RECORDING IS ON
modules:
  - MOD-job-ledger
builds_on:
tests:
  - unit
origin:
  - the architecture of the prompt bar, accepted by akmaier at 7e893c63 (110d2499)
  - MOD-job-ledger, Data: the start's fields `task` and `conversation`, `## End`; Interfaces: JobStart
---
# ITM-490 A job record says that its task travels with its hand-over

**REGISTER**

## Outcome

MOD-job-ledger's start record holds `task` — `in parameters`, or `with the hand-over` — and `conversation`, the path of
the conversation record a hand-over came from or empty; a job whose task travels with the hand-over holds no message of
the conversation in its parameters and no `draft:` in its end.

No existing test's expected result changes, release tests included: the tests that write a start compare it with
`startRecord`'s own text, TST-472297 (`tests/job-ledger.test.mjs`) reads the start field by field, and TST-472210
(`tests/documents.test.mjs`) writes back an earlier record without `task` and `conversation`, which reads as before.

## Acceptance

- A start of each kind is written and read back with both fields; an earlier record without them reads as `in
  parameters` and no conversation.
- A counter-proof: a message planted in the parameters of a record whose task travels with the hand-over is
  found.
- Each test states its expected values in its own text (`A TEST DOES NOT TAKE ITS EXPECTED RESULT FROM A DOCUMENT`); an
  existing test that the change turns red is not changed here: the Developer stops and names it.
