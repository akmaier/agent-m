---
id: ITM-346
title: The explanations of deriving requirements
level: module
realises:
  - UC-005
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-site-frame
builds_on:
  - ITM-221
tests:
  - unit
origin:
  - UC-005 steps 1 to 8
---
# ITM-346 The explanations of deriving requirements

**REGISTER**

## Outcome

The topics of MOD-site-frame's `explanations.md` that UC-005 names: the linked version and its hash; the existing
requirements sent with the excerpt; the run panel; the four classes of a candidate; the correction rounds; a conflict
and a normative source; the queue that *Write proposals* writes. The derivation page shows them folded (ITM-361).

## Acceptance

- Unit tests that name MOD-site-frame state, before the code exists, that `explain` gives each new topic, folded, with
  its text.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/site-frame/` and the tests that name MOD-site-frame change.
