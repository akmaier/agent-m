---
id: ITM-867
title: An opened requirement reads the instance once per load
level: unit
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-trace-pages
builds_on:
  - ITM-846
tests:
  - unit
origin:
  - ITM-846's pull request #822 (sprint team1/81), from developer-sonnet-c's finding 2
---
# ITM-867 An opened requirement reads the instance once per load

**REGISTER**

## Outcome

MOD-trace-pages' `sourcesOf` (`src/trace-pages/flow.mjs`) reads the instance's repository information and snapshot at the
first opening of each drawing: three requests, with a token or without. Where the page has already read the instance, as
the specification view's `personsSource` does, they are read a second time. At the start, the page is counted with two
openings at this repository's size. The instance is then read once per load and shared, as ITM-848 did for
MOD-review-pages.

## Acceptance

- Opening a requirement reads the instance's commit and tree no more than once per load, and a test counts it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
