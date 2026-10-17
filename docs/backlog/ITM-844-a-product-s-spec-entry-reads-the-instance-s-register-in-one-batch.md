---
id: ITM-844
title: A product's SPEC entry reads the instance's register in one batch
level: unit
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-review-pages
builds_on:
  - ITM-830
tests:
  - unit
origin:
  - ITM-830's draft stop (sprint team1/77), stop 3
---
# ITM-844 A product's SPEC entry reads the instance's register in one batch

**REGISTER**

## Outcome

On a product's SPEC entry page, MOD-review-pages' `sourcesOf` reads the instance's register (`docs/sources.md` and the SRC
files) from the instance's snapshot, one file at a time. Its other callers read the same way: `jobs.mjs:243`, `:344` and
`:459`, `requirements-draft.mjs:31`, and the accept click. ITM-830's draft added a `readMany` there, but no test reaches
it, since the harness's instance throws, so it was dropped.

At the start, a test with a second fake for the instance counts a product's entry page with a token, before and after.
The read-ahead comes back only with that test.

## Acceptance

- A product's entry page reads the instance's register in one batch with a token, and the test counts it.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
