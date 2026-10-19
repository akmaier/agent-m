---
id: ITM-1017
title: Every test names a module of the architecture in its header
level: unit
realises:
  - EVERY CODE FILE BELONGS TO A MODULE
modules:
  - MOD-test-document
builds_on:
tests:
  - unit
origin:
  - ITM-432's and ITM-413's reads (sprint team1/93), by developer-sonnet-c
---
# ITM-1017 Every test names a module of the architecture in its header

**REGISTER**

## Outcome

At least a dozen Python tests name `# Module: system`, for example `tests/test_mail_routes.py:1`,
`test_mail_password_route.py:1` and `test_implementation_job.py:1`. `system` is a level, not a module. SPEC.md:1449-1451:
"every test and test helper names in its header a module of the architecture".

**First task:** list every test whose header names no module of the architecture, with a known positive.

## Acceptance

- Every test's header names a module of the architecture, and the check that lists those that do not finds none.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
