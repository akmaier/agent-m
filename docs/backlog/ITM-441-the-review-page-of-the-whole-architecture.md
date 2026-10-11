---
id: ITM-441
title: The review page of the whole architecture
level: module
realises:
  - UC-022
  - SEVERAL FILES ARE ACCEPTED IN ONE CLICK
  - ARCHITECTURE RESTS ON ACCEPTED ARTIFACTS
  - ONE CLICK PER DECISION
  - THE ROUNDS ARE COUNTED AND SHOWN
  - A REUSE DECISION RECORDS ITS DUE DILIGENCE
modules:
  - MOD-review-pages
builds_on:
  - ITM-440
  - ITM-356
tests:
  - unit
origin:
  - UC-022 steps 8 and 10, 10a
---
# ITM-441 The review page of the whole architecture

**REGISTER**

## Outcome

MOD-review-pages' *Review all* for the architecture, `decision/all`, in `flow.mjs` and `sections.mjs`, as its file
states it: the review page of the whole architecture — the decision that states the system first, then the subsystems'
decisions, the module files, and the further decisions with their due-diligence sections —, a changed file as its
difference and a new one in full, with the rounds of the job that drafted them as its record holds them, each finding
with its correction or answer and every finding left; *Accept all N shown*, one commit with one record per file shown, a
file that changed after it was shown or that names a requirement or use case not accepted left out and named.

## Acceptance

- Unit tests that name MOD-review-pages state, before the code exists, in the small DOM, on a fixture repository and a
  fixture job record: the files in their order; the due-diligence table and the rounds, with a finding answered and one
  left; *Accept all N shown* writing one record per file shown; a file changed after it was shown left out and named; a
  decision that names an open use case left out and named.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/review-pages/` and the tests that name MOD-review-pages change.
