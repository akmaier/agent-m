---
id: ITM-1136
title: The check `tests/test_job_cost.py` is written, as the SPEC names it
level: module
realises:
  - NO COST IS GUESSED
modules:
  - MOD-job-ledger
builds_on:
tests:
  - unit
origin:
  - developer-sonnet-i's release tests of UC-049 (ITM-513, pull request #1162, head 3d20fdc1)
---
# ITM-1136 The check `tests/test_job_cost.py` is written, as the SPEC names it

**REGISTER**

## Outcome

The SPEC names `tests/test_job_cost.py` as the Check of the requirements this item realises, and the file does not
exist. SPEC.md:1814 names it. Each requirement's Check sentence is a test that can be written against the SPEC as it
stands: the file is written as the SPEC words each check and counter-proof. Data in a Markdown file and code in the
Python file (AGENTS.md §7), as `tests/test_conversation_not_recorded.py` does.
- A case that fails on the code as it stands is a finding. It is marked as the repository's release tests mark one, and
  the Product Owner registers an item for it.
- Where a Check sentence cannot be tested as worded, the writer stops and names it. A wrong pointer is a SPEC draft for
  akmaier.
- `tests/release-uc-049-talk-to-an-agent-in-the-prompt-bar.test.mjs` lists the missing checks in `MISSING_CHECKS`; a
  file written here moves to its evidence, as TST-513201 asks.

## Acceptance

- `tests/test_job_cost.py` exists and holds a case for each check and counter-proof the SPEC's Check sentences name.
  Each case is shown to fail on a fault planted in the code it checks.
- It is not written by the implementer of the behaviour it checks, where that behaviour is released.
