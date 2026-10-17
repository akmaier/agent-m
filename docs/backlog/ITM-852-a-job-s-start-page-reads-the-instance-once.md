---
id: ITM-852
title: A job's start page reads the instance once
level: unit
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-review-pages
builds_on:
  - ITM-848
tests:
  - unit
origin:
  - ITM-848's draft stop (sprint team1/79), from developer-sonnet-d's finding
---
# ITM-852 A job's start page reads the instance once

**REGISTER**

## Outcome

On a page that starts a drafting job, MOD-review-pages' `loadStage` (`src/review-pages/jobs.mjs:65`) builds a second
snapshot of the instance, beside the one `sourcesOf` builds (`jobs.mjs:243`, `:344`, `:459`). Each costs the instance's
repository information, commit and tree. After ITM-848, `sourcesOf` takes a snapshot it is handed. This item hands it the
one `loadStage` built. The start counts a job's start page before and after, with a token and without.

## Acceptance

- A job's start page reads the instance's commit and tree once, and a test counts it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
