---
id: ITM-1085
title: A proposed test case may be of level user
level: module
realises:
  - UC-026
  - EVERY TEST HAS ONE LEVEL
modules:
  - MOD-job-catalogue
builds_on:
tests:
  - unit
origin:
  - the gate of #1089 (ITM-764), sprint team2/96, on main at c91f92d0
---
# ITM-1085 A proposed test case may be of level user

**REGISTER**

## Outcome

MOD-test-document.md:54 gives a test's level as "one of `unit`, `component`, `system`, `release`, `user`". The answer schema
of `propose-tests` (`src/job-catalogue/kinds/propose-tests/answer.schema.json`) lists the level's enum without `user`. So the
route `generate` reaches `user` only when a case is reclassified (ITM-764).

## Acceptance

- The answer schema's level enum holds the five levels of MOD-test-document. A unit test naming MOD-job-catalogue shows a
  proposed case of level `user` accepted, and one of another word refused.
- Counter-proof: the old enum refuses the `user` case.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/job-catalogue/kinds/propose-tests/` and the tests that name MOD-job-catalogue change.
