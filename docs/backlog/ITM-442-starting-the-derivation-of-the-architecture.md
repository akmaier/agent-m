---
id: ITM-442
title: Starting the derivation of the architecture
level: module
realises:
  - UC-022
  - THE FIRST ARCHITECTURE IS DESIGNED AS A WHOLE
  - ARCHITECTURE IS DESIGNED ONLY AGAINST ACCEPTED USE CASES
  - NO REVIEWER IS THE DRAFTER
  - THE PAGE STATES WHAT IT SENDS WHERE
  - RESTRICTED CONTENT GOES ONLY WHERE ITS SOURCE PERMITS
  - NOTHING IS LEFT OUT OF AN ARCHITECTURE PROMPT SILENTLY
  - ONE CLICK PER DECISION
  - EVERY STEP EXPLAINS ITSELF
modules:
  - MOD-review-pages
builds_on:
  - ITM-362
  - ITM-437
  - ITM-438
  - ITM-439
  - ITM-344
  - ITM-318
  - ITM-319
  - ITM-440
tests:
  - unit
origin:
  - UC-022 steps 1 to 4, 1a, 1b, 1c, 2a, 3a, 4a
---
# ITM-442 Starting the derivation of the architecture

**REGISTER**

## Outcome

MOD-review-pages' route `decision/draft`, in `jobs.mjs`, as its file states it, up to *Run*: what the derivation covers
— every requirement and every use case, with no selection —; the findings of `architecture-ready` (ITM-437) — an open
use case named and its review linked, an open SPEC change named with the choice to decide it first, an existing
architecture leading to UC-023 —; the drafting and the reviewing participant, each one that can draft text, with where
it processes data, a participant whose place a linked source forbids for the content left out, and a reviewer offered
only if it differs from the drafter in participant and in model (`differs`), *Run* disabled with its reason when none
does; the run panel of `derive-architecture` (ITM-344), what does not fit named and nothing sent; *Run*, one click, the
job run in this tab, attended (ITM-319), or queued on another route (ITM-318). The draft waiting for the author is
ITM-443's.

## Acceptance

- Unit tests that name MOD-review-pages state, before the code exists, in the small DOM with fixture participants and a
  fixture repository: no selection offered; each finding of the precondition shown; a reviewer that uses the drafter's
  model not offered, and *Run* disabled with its reason; a participant a source's place forbids left out; a run panel
  naming every part and every destination; a part that does not fit named and *Run* not offered; *Run* starting one job.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/review-pages/` and the tests that name MOD-review-pages change.
