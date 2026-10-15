---
id: ITM-513
title: The system and release tests of UC-049
level: system
realises:
  - UC-049
modules:
  - MOD-prompt-bar
builds_on:
  - ITM-498
  - ITM-505
  - ITM-507
  - ITM-508
  - ITM-509
  - ITM-510
  - ITM-511
  - ITM-512
tests:
  - system
  - release
origin:
  - UC-049
---
# ITM-513 The system and release tests of UC-049

**REGISTER**

## Outcome

UC-049 checked as a whole: a system test that walks the main flow and each alternative flow through the dashboard,
with fixture endpoints, a fixture Bridge, a fixture repository host and the job workflow over fixture checkouts; and
release tests, one or more for each requirement UC-049 realises. A flow no item has built yet is a pending finding.

## Acceptance

- Each test states its input, precondition and expected result, names what it guards, and has a counter-proof recorded
  in the pull request.
- Only new test files change; their author implemented none of UC-049's behaviour (`RELEASE TESTS ARE NOT WRITTEN BY THE
  IMPLEMENTER`).
