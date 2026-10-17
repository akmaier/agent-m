---
id: ITM-657
title: A requirement whose source moved on is marked source changed
level: module
realises:
  - UC-016
  - UC-020
modules:
  - MOD-trace-pages
builds_on:
  - ITM-637
tests:
  - unit
origin:
  - the coverage of UC-001 to UC-020 (docs/measurements/2026-10-16_coverage-uc-001-020.md), whose row was blocked on a draft that akmaier accepted in b43da779
---
# ITM-657 A requirement whose source moved on is marked source changed

**REGISTER**

## Outcome

UC-016 step 5: "requirements are marked *source changed* … until each is looked at again". MOD-trace-pages'
`specification` descriptor (accepted text): "where MOD-source-register's `affectedRequirements` names it for a source
the product moved to a newer version after its section last changed, *source changed* until its section changes". It
builds on ITM-637's `affectedRequirements(spec, register, source)`. What it reads to know when a section last changed
is measured against the token budget at its start (sprint 66's agreement).

## Acceptance

- A requirement that `affectedRequirements` names for a source the product moved to a newer version after the requirement's section last changed is marked *source changed*.
- Once its section changes, the mark is gone.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
