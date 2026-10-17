---
id: ITM-848
title: A product's SPEC entry reads the instance once
level: unit
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-review-pages
builds_on:
  - ITM-844
tests:
  - unit
origin:
  - ITM-844's pull request #791 (sprint team1/78), from developer-sonnet-d's finding 1
---
# ITM-848 A product's SPEC entry reads the instance once

**REGISTER**

## Outcome

On a product's SPEC entry page, MOD-review-pages builds the instance's snapshot twice. `ownSource`
(`src/review-pages/subjects.mjs:85`) and `sourcesOf` each read the instance's repository information, commit and tree, so
three requests are made twice. TST-844201 pins the total of seven requests to the instance.

`A PAGE LOAD READS THE REPOSITORY IN BATCHES` asks for "its commit and that commit's tree once". Here the page reads the
instance's twice. Both functions are the module's own, so they share the one snapshot of the load. The start names every
caller of `sourcesOf` (jobs, requirements-draft, the accept click) and how each gets it.

## Acceptance

- A product's entry page reads the instance's commit and tree once, with a token, and TST-844201's count falls by three.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
