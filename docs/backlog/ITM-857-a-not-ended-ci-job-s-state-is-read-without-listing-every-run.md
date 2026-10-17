---
id: ITM-857
title: A not-ended CI job's state is read without listing every run
level: unit
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-runtimes
builds_on:
  - ITM-847
tests:
  - unit
origin:
  - ITM-847's draft stop (sprint team1/79), from developer-sonnet-e's findings
---
# ITM-857 A not-ended CI job's state is read without listing every run

**REGISTER**

## Outcome

For each job taken by CI that has not ended, `liveState` lists the whole workflow's runs (`src/runtimes/ci.mjs:241`, through
`github.mjs:319`). A re-read of the main page then costs one listing, of one or more pages, per such job. This lead is
from the code. At the start, it is counted with several not-ended CI jobs. Where one listing serves them all, they share
it.

## Acceptance

- The requests for N not-ended CI jobs do not grow with N beyond one listing, and a test counts it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.

**Noted at ITM-847's gate (sprint team1/79, 2026-10-17, po-opus).** When the run listing meets a used-up limit,
MOD-main-page's `liveStatesOf` shows the job as not reachable. A used-up limit is named as such (`A USED-UP RATE LIMIT IS
NAMED`), not as an unreachable runtime. This item names it so, with a test.
