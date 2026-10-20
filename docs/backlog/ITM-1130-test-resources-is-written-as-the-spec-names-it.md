---
id: ITM-1130
title: The check `tests/test_resources.py` is written, as the SPEC names it
level: module
realises:
  - A PRODUCT DECLARES ITS RESOURCES
  - A RESOURCE IS USED, A PARTICIPANT DEVELOPS
  - THE RESOURCE KIND IS ONE OF A CLOSED SET
  - A RESOURCE IS PINNED TO AN EXACT STATE
  - A RESOURCE DECLARES ITS LICENCE
  - A RESTRICTED RESOURCE IS REFERENCED, NEVER COPIED
  - A RESOURCE NAMES ITS MAINTAINER
  - A COMPUTE RESOURCE IS REACHED THROUGH THE BRIDGE OR A SELF-HOSTED RUNNER
  - A RESOURCE DECLARES WHERE IT PROCESSES DATA
  - A JOB RUNS ONLY WHERE ITS RESOURCES ARE REACHABLE
  - THE INSTANCE DECLARES ITS OWN RESOURCES
  - INSTANCE AND PRODUCT RESOURCES ARE INDEPENDENT
modules:
  - MOD-resource-list
builds_on:
tests:
  - unit
origin:
  - developer-sonnet-f's release tests of UC-040 (ITM-1041, pull request #1164, head aec01f83)
---
# ITM-1130 The check `tests/test_resources.py` is written, as the SPEC names it

**REGISTER**

## Outcome

The SPEC names `tests/test_resources.py` as the Check of the requirements this item realises, and the file does not
exist. SPEC.md:2194-2294 names it as the Check of twelve requirements. `A RESOURCE IS USED, A PARTICIPANT DEVELOPS` has
no executable evidence at all. Each requirement's Check sentence is a test that can be written against the SPEC as it
stands: the file is written as the SPEC words each check and counter-proof. Data in a Markdown file and code in the
Python file (AGENTS.md §7), as `tests/test_conversation_not_recorded.py` does.
- A case that fails on the code as it stands is a finding. It is marked as the repository's release tests mark one, and
  the Product Owner registers an item for it.
- Where a Check sentence cannot be tested as worded, the writer stops and names it. A wrong pointer is a SPEC draft for
  akmaier.

## Acceptance

- `tests/test_resources.py` exists and holds a case for each check and counter-proof the SPEC's Check sentences name.
  Each case is shown to fail on a fault planted in the code it checks.
- It is not written by the implementer of the behaviour it checks, where that behaviour is released.
