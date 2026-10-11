---
id: ITM-362
title: Drafting use cases on the review pages
level: module
realises:
  - UC-007
  - ONE CLICK PER DECISION
  - THE PAGE STATES WHAT IT SENDS WHERE
  - A GENERATED ARTIFACT IS A PROPOSAL
  - A REVIEWED ARTIFACT ENTERS THE DEFAULT BRANCH AS OPEN
  - THE ROUNDS ARE COUNTED AND SHOWN
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-review-pages
builds_on:
  - ITM-355
  - ITM-308
  - ITM-318
  - ITM-319
  - ITM-332
  - ITM-336
  - ITM-337
  - ITM-344
  - ITM-348
  - ITM-328
  - ITM-330
  - ITM-387
tests:
  - unit
origin:
  - UC-007 steps 1 to 6, 4a, 4b, 6a
---
# ITM-362 Drafting use cases on the review pages

**REGISTER**

## Outcome

MOD-review-pages' route `use-case/draft` in its part `jobs.mjs`, as its file states them: the requirements to cover, by
default those no use case realises (ITM-308); the participants that can draft text, each with where it processes data,
and its routes (ITM-318); the run panel of `derive-use-cases` (ITM-344) and *Run*, one click; a model endpoint's job run
in this tab, attended (ITM-319), whose files are written open at once (ITM-336) and appear in the list, with the rounds
and what the loop left; beside an open use case a job wrote, the notes of that job's end record — a realised name it
removed, a use case that realises none (UC-007 4a, 4b); a job on another route queued there. The view hands the frame
the strategies its kinds use in the tab (ITM-332, ITM-337, ITM-336); the check `candidate-classes` is the runner's
(ITM-387). The use-case list's *Draft use cases* leads here. Its explanations are shown folded (ITM-348). Following a
job on another route (UC-036) is not part of this item.

## Acceptance

- Unit tests that name MOD-review-pages state, before the code exists, with a fixture host, a fixture endpoint driver
  and the strategies registered: the default selection; *Run* offered only from the panel; the files written open in one
  commit and listed open; the rounds shown; a job's notes shown beside the use case they concern; a job on the CI route
  queued and not run in the tab; nothing written without the click.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/review-pages/` and the tests that name MOD-review-pages change.
