---
id: ITM-361
title: Deriving requirements from a source on the review pages
level: module
realises:
  - UC-005
  - THE PAGE STATES WHAT IT SENDS WHERE
  - ONE CLICK PER DECISION
  - A GENERATED ARTIFACT IS A PROPOSAL
  - THE MODEL'S CLASSIFICATION IS MEASURED, NOT TRUSTED
  - A CONFLICT IS DECIDED BY A PERSON
  - THE ROUNDS ARE COUNTED AND SHOWN
  - NO REQUIREMENT IS LEFT OUT OF THE CONTEXT SILENTLY
modules:
  - MOD-review-pages
builds_on:
  - ITM-355
  - ITM-318
  - ITM-319
  - ITM-337
  - ITM-338
  - ITM-344
  - ITM-346
  - ITM-329
tests:
  - unit
origin:
  - UC-005 steps 1 to 8, 1a, 2a, 3a, 6a, 7a, 7b
---
# ITM-361 Deriving requirements from a source on the review pages

**REGISTER**

## Outcome

MOD-review-pages' route `spec-entry/draft` in its part `jobs.mjs`, with the SPEC entry's descriptor, as its file states
them: a linked source and its part; the participant and its routes (ITM-318); the run panel (ITM-344) with how many
requirements are included; *Run* in this tab, attended (ITM-319); then the candidates grouped by class beside the
requirement each refers to, the normative side named, classes changeable, conflicts decided, a flagged candidate split,
the rounds and what the loop left; *Write proposals*, through `writeResult` and the writer `queue-entries` (ITM-338). A
changed hash or a context too small is named, and nothing is sent. Its explanations are shown folded (ITM-346). The kind
`derive-requirements` names the check `candidate-classes`, which the runner does not register; the tests register a
fixture check of that name. Offering a smaller part of the source when the input does not fit, and recognising a
candidate from a source the product does not link (UC-005 5a), are not part of this item.

## Acceptance

- Unit tests that name MOD-review-pages state, before the code exists, over a fixture host and a fixture participant:
  each part named on the panel; the candidates by class; a class moved and a conflict decided reaching the writer; an
  undecided conflict not written; a changed hash and a context too small sending nothing.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/review-pages/` and the tests that name MOD-review-pages change.
