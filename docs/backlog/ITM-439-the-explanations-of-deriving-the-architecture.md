---
id: ITM-439
title: The explanations of deriving the architecture
level: module
realises:
  - UC-022
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-site-frame
builds_on:
  - ITM-221
tests:
  - unit
origin:
  - UC-022 steps 1, 2, 6 and 7, 7c
---
# ITM-439 The explanations of deriving the architecture

**REGISTER**

## Outcome

The topics of MOD-site-frame's `explanations.md` that UC-022 names, written for someone new to them: what an
architecture is — the system, its subsystems and modules, the four views, the pattern families and the design principles
—, with the table of UC-022 and a pointer to book ch. 10; the reviewing participant and its rounds; the due diligence;
what a licence permits. The architecture's pages show them folded (ITM-442, ITM-443).

## Acceptance

- Unit tests that name MOD-site-frame state, before the code exists, that `explain` gives each new topic, folded, with
  its text.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/site-frame/` and the tests that name MOD-site-frame change.
