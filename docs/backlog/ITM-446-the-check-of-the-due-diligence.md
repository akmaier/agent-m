---
id: ITM-446
title: The check of the due diligence
level: system
realises:
  - A REUSE DECISION RECORDS ITS DUE DILIGENCE
  - A PRODUCT DECLARES ITS LICENCE
  - A REUSED LICENCE IS SHOWN AGAINST THE PRODUCT'S
  - DUE DILIGENCE IS FETCHED, NOT RECALLED
modules:
  - MOD-reuse-facts
builds_on:
  - ITM-436
tests:
  - release
origin:
  - SPEC.md: the check `tests/test_reuse_due_diligence.py` its requirements name
---
# ITM-446 The check of the due diligence

**REGISTER**

## Outcome

`tests/test_reuse_due_diligence.py`, the check SPEC.md names for these requirements: MOD-reuse-facts' step
`due-diligence` (ITM-436) over fixture drafts and fixture registries — a reuse decision gaining, for the chosen
candidate and each alternative, its licence, its release history, how its issues are handled and its adoption; a GPL-3.0
candidate of an MIT product marked, an MIT one not; a product without `LICENSE` with every licence *not checked*; a
record with a fact that lacks its address or its date failing; a candidate whose package does not exist in its registry
reported as not found.

## Acceptance

- Each test states its input, its precondition and its expected result where they can be read without running it, names
  what it guards, the module it exercises and its level `release`; its cases stand in a Markdown data file beside it and
  the Python file only loads them (AGENTS.md §7).
- It is written by a participant who implemented none of the behaviour it tests (`RELEASE TESTS ARE NOT WRITTEN BY THE
  IMPLEMENTER`); each test's counter-proof — a fault planted in the code it guards, and the test failing on it — is
  recorded in the pull request.
- Where the code does not do what the requirement says, the test follows the requirement and the disagreement is named
  as a finding.
- Only the new test file and its data file change.

**Not done: what is missing.** TST-446101 tests the test's own helper `record_findings`
(`tests/test_reuse_due_diligence.py:176-198`), not product code. No product code checks a due-diligence row for an empty
*Read from* or *Read on*: `src/reuse-facts/index.mjs:593` writes the table's header and nothing reads the cells back.
