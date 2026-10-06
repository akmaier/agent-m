---
id: ITM-208
title: The system and release tests of UC-001
level: system
realises:
  - UC-001
modules:
  - MOD-repository-hosts
  - MOD-spec-document
  - MOD-artifact-edits
builds_on:
  - ITM-205
  - ITM-206
tests:
  - system
  - release
origin:
  - UC-001
---
# ITM-208 The system and release tests of UC-001

**REGISTER**

## Outcome

UC-001 checked as a whole through the dashboard's add-product page as it calls the modules of ITM-205 and ITM-206 — the
repository hosts that read and write the product, and the review layout that step C writes: a system test that walks its
main flow and its alternative flows through that page, with GitHub and a GitLab server replaced by fixture servers, and
release tests, one or more for each requirement UC-001 realises. They are written by a participant other than the one who
implemented the behaviour they test (`RELEASE TESTS ARE NOT WRITTEN BY THE IMPLEMENTER`).

## Acceptance

- The system test and the release tests state their input, precondition and expected result where they can be read
  without running them, each naming what it guards, and each with its recorded counter-proof — a fault planted in the
  code it guards, and the test failing on it.
- Their author implemented neither ITM-205 nor ITM-206 nor the page's calls into their modules, and is named in the pull
  request.
- They are green on the sprint branch.
- Only test files change.
