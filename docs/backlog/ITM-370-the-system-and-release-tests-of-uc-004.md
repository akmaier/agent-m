---
id: ITM-370
title: The system and release tests of UC-004
level: system
realises:
  - UC-004
modules:
  - MOD-settings-pages
  - MOD-source-register
builds_on:
  - ITM-350
tests:
  - system
  - release
origin:
  - UC-004
---
# ITM-370 The system and release tests of UC-004

**REGISTER**

## Outcome

UC-004 checked as a whole through the library page, once ITM-350 and the change between jobs by which the dashboard
reaches MOD-settings-pages' route `library` are merged: a system test that walks the main flow to step 6 and the
alternative flows 4a, 4b, 4c and 1a, with GitHub replaced by a fixture server; and release tests, one or more for each
requirement UC-004 realises. Step 7 and its alternative 7a — the fetch of an EU legal text — and the release test of `AN
EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY` are not part of this item. The tests are written by a Developer
who implemented none of ITM-313, ITM-314, ITM-345 and ITM-350, nor that change (`RELEASE TESTS ARE NOT WRITTEN BY THE
IMPLEMENTER`).

## Acceptance

- Every requirement UC-004 realises but the one named above has a release test, and the system test walks the main
  flow and each alternative flow named; each test states its input, precondition and expected result where they can be
  read without running it, and names what it guards.
- Each new test's counter-proof — a fault planted in the code it guards, and the test failing on it — is recorded in
  the pull request, which names the author.
- Where the dashboard and UC-004 disagree, the test follows UC-004 and the disagreement is named as a finding.
- Only new test files change.
