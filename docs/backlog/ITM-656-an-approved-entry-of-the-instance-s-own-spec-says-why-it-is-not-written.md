---
id: ITM-656
title: An approved entry of the instance's own SPEC says why it is not written
level: module
realises:
  - UC-014
modules:
  - MOD-review-pages
builds_on:
tests:
  - unit
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), whose row was blocked on a draft that akmaier accepted in b43da779
---
# ITM-656 An approved entry of the instance's own SPEC says why it is not written

**REGISTER**

## Outcome

UC-014 step 4 and 4a: "When a feature first needs them, the dashboard shows this step again", "offers step 3".
MOD-review-pages' `<k>` (accepted text): "An entry of the instance's own SPEC whose approval record is committed but
whose section is not written, because the instance's workflows are not turned on, is shown *approved*, not *in SPEC*,
with why and a link to the Actions step of MOD-settings-pages' `get-your-own` (UC-014 step 4, 4a)." How the page knows
that the workflows are off, and its reads, are read at the start.

## Acceptance

- An entry of the instance's own SPEC with its approval record committed and its section not written is shown *approved*, with why and the link to the Actions step.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
