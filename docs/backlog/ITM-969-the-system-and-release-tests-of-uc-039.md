---
id: ITM-969
title: The system and release tests of UC-039
level: system
realises:
  - UC-039
modules:
  - MOD-maintenance-pages
  - MOD-mail-handling
builds_on:
  - ITM-966
  - ITM-967
  - ITM-968
tests:
  - system
  - release
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-039-6, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-969 The system and release tests of UC-039

**REGISTER**

## Outcome

UC-039 is checked as a whole through the routes `replies` and `replies/<issue>` (MOD-maintenance-pages.md:117-122),
started by the frame's `startPage`, over fixture issue trackers and both mailbox routes:
- Microsoft Graph replaced by a fixture server;
- the Bridge with the local IMAP and SMTP servers of `tests/mail-protocols-fixture.mjs`.

The system test walks the main flow (UC-039.md:78-104) and the alternative flows 2a, 2b, 2c, 3a, 3b, 4a, 5a, 5b, 6a,
1a, 1b and 7a. There are release tests, one or more for each requirement UC-039 realises (UC-039.md:12-37), as ITM-433
did for UC-037.

## Acceptance

- Every requirement UC-039 realises has a release test, and the system test walks the main flow and each alternative
  flow named. Each test states its input, precondition and expected result, and names what it guards.
- Each new test's counter-proof is recorded in the pull request, which names its author. The author implemented none of
  ITM-953, ITM-954 and ITM-966 to ITM-968 (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).
- Where the page and UC-039 disagree, the test follows UC-039 and names the disagreement as a finding.
- The live page is not required: it loads MOD-maintenance-pages only after ITM-700.
