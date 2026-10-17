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

**Decided at its draft stop (sprint team1/79, 2026-10-17, po-opus).**
- **The changed tests are accepted as named changes,** each a count that falls with this item's one change:
  - TST-844201, from 7 to 4;
  - TST-844202, from 8 to 5;
  - the two cases of `review-pages-read-problem.test.mjs`, from 14 to 12 and from 26 to 24.

  They are fixed before the red. All are MOD-review-pages tests.
- **The known positive.** ITM-844's gate stated 13 and 17 for a product's entry page, measured at this repository's size.
  The harness's fixture gives 14 and 26. Both are counts, of different fixtures.
  - The developer measures the base again at this repository's size, by ITM-844's method, and states whether 13 and 17
    hold.
  - If they do not, the difference is explained before the gate.
  - The tests pin the harness's counts.
- **Release test TST-418101's counter-proof** (`AGENT_M_418_COUNTERPROOF=1`) is run on the base and on the head before the
  pull request, since `ownSource`'s line 85 is what it matches.
- **The other callers of `sourcesOf`** stay as they are. A job's start page's second snapshot is ITM-852.
