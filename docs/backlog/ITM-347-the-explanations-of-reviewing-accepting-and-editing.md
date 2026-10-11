---
id: ITM-347
title: The explanations of reviewing, accepting and editing
level: module
realises:
  - UC-006
  - UC-008
  - UC-018
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-site-frame
builds_on:
  - ITM-221
tests:
  - unit
origin:
  - UC-006 steps 2 and 4, 4b to 4d
  - UC-008 steps 1 to 3, 2a, 3b to 3e
  - UC-018
---
# ITM-347 The explanations of reviewing, accepting and editing

**REGISTER**

## Outcome

The topics of MOD-site-frame's `explanations.md` for every step of the review pages that asks something of the person,
written for someone new to GitHub, each with a pointer to the book where one applies: what accepting does and what an
approval record is; what a blob SHA is; why an edit after acceptance reopens the review; why a SPEC edit waits for
approval while a use-case edit is saved at once; what a change queue is, and its order; GitHub's page without a token.
The texts that the old dashboard's review steps carry are the model. The review pages show them folded (ITM-355,
ITM-357, ITM-358, ITM-359).

## Acceptance

- Unit tests that name MOD-site-frame state, before the code exists, that `explain` gives each new topic, folded, with
  its text.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/site-frame/` and the tests that name MOD-site-frame change.
