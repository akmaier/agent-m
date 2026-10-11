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
  - ITM-401
  - ITM-402
tests:
  - system
  - release
origin:
  - UC-004
---
# ITM-370 The system and release tests of UC-004

**REGISTER**

## Outcome

UC-004 checked as a whole through the library page, once ITM-350 and ITM-402 and the change between jobs by which the
dashboard reaches MOD-settings-pages' route `library` are merged, and the instance's workflow file that runs
`onSourcesCommitted` (ITM-401) is in place: a system test that walks the main flow and the alternative flows 4a, 4b, 4c,
1a and, for an EU legal text, step 7 and 7a — the fetch, its failure and *Fetch again* —, with GitHub and the EU's
publication repository replaced by fixture servers; and release tests, one or more for each requirement UC-004 realises,
`AN EU LEGAL TEXT IS FETCHED FROM THE OFFICIAL REPOSITORY` among them. The tests are written by a Developer who
implemented none of ITM-313, ITM-314, ITM-345, ITM-350, ITM-385, ITM-400, ITM-401 and ITM-402, nor that change (`RELEASE
TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- Every requirement UC-004 realises has a release test, and the system test walks the main flow and each alternative
  flow named; each test states its input, precondition and expected result where they can be read without running it,
  and names what it guards.
- Each new test's counter-proof — a fault planted in the code it guards, and the test failing on it — is recorded in the
  pull request, which names the author.
- Where the library page and UC-004 disagree, the test follows UC-004 and the disagreement is named as a finding.
- Only new test files change.
