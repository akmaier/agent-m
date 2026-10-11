---
id: ITM-348
title: The explanations of drafting use cases and of changing one by prompt
level: module
realises:
  - UC-007
  - UC-019
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-site-frame
builds_on:
  - ITM-221
tests:
  - unit
origin:
  - UC-007
  - UC-019 step 2
---
# ITM-348 The explanations of drafting use cases and of changing one by prompt

**REGISTER**

## Outcome

The topics of MOD-site-frame's `explanations.md` that the steps of UC-007 and UC-019 need, written for someone new to
them: the requirements to cover; the participant and where it processes data; the run panel and what is sent; the
correction loop, its findings and rounds; drafted use cases written open and accepted in UC-008; the instruction, with
the examples UC-019 step 2 gives — split a requirement, make a rule checkable, add an alternative flow, align a use case
with a changed requirement —; the difference against the current text; *Save*, which writes a use case open; a CI
agent's draft. The drafting and prompt pages show them folded (ITM-362, ITM-363).

## Acceptance

- Unit tests that name MOD-site-frame state, before the code exists, that `explain` gives each new topic, folded, with
  its text.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/site-frame/` and the tests that name MOD-site-frame change.
