---
id: ITM-1131
title: The check `tests/test_no_secret_written.py` is written, as the SPEC names it
level: system
realises:
  - NO SECRET IN THE REPOSITORY
  - A RESOURCE ENTRY NAMES ITS SECRET, NOT ITS VALUE
modules:
  - MOD-documents
builds_on:
  - ITM-1122
tests:
  - system
origin:
  - developer-sonnet-f's release tests of UC-040 (ITM-1041, pull request #1164, head aec01f83)
---
# ITM-1131 The check `tests/test_no_secret_written.py` is written, as the SPEC names it

**REGISTER**

## Outcome

The SPEC names `tests/test_no_secret_written.py` as the Check of the requirements this item realises, and the file does
not exist. SPEC.md:39 and :2259 name it. It builds on ITM-1122, whose fault it would catch. Each requirement's Check
sentence is a test that can be written against the SPEC as it stands: the file is written as the SPEC words each check
and counter-proof. Data in a Markdown file and code in the Python file (AGENTS.md §7), as
`tests/test_conversation_not_recorded.py` does.
- A case that fails on the code as it stands is a finding. It is marked as the repository's release tests mark one, and
  the Product Owner registers an item for it.
- Where a Check sentence cannot be tested as worded, the writer stops and names it. A wrong pointer is a SPEC draft for
  akmaier.
- `tests/release-uc-049-talk-to-an-agent-in-the-prompt-bar.test.mjs` lists the missing checks in `MISSING_CHECKS`; a
  file written here moves to its evidence, as TST-513201 asks.

## Acceptance

- `tests/test_no_secret_written.py` exists and holds a case for each check and counter-proof the SPEC's Check sentences
  name. Each case is shown to fail on a fault planted in the code it checks.
- It is not written by the implementer of the behaviour it checks, where that behaviour is released.
