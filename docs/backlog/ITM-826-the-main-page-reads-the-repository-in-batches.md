---
id: ITM-826
title: The main page reads the repository in batches
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-progress-measures
builds_on:
tests:
  - unit
origin:
  - the count of the main page's requests before ITM-684 (sprint team1/76), by developer-sonnet-e
---
# ITM-826 The main page reads the repository in batches

**REGISTER**

## Outcome

The main page sends 1006 requests per load on this repository, with a token and without (origin/main `8efb2e0a`,
developer-sonnet-e's count):
- the commit and the tree;
- 616 backlog items and 372 job records, each read by itself;
- four decision files, `SPEC.md` and `docs/process.md`;
- eight pages of pull requests, the tags and the CI runs.

`A PAGE LOAD READS THE REPOSITORY IN BATCHES` asks for "the texts of the files it shows in requests of at most 100 files
each". The count grows with every item, job and pull request. With a token, one opening spends a fifth of the hourly
budget.

The old page (`src/home/`) belongs to no module, and only MOD-main-page's job that moves it may change it (ITM-684). So
the reads are fixed where the moved page will make them:
- MOD-progress-measures' `productFacts` builds the scope `all`, which today throws (`src/progress-measures/facts.mjs:122`);
- it reads the items, job records and decision files of a snapshot through `Snapshot.readMany`, in batches of a hundred.

The start names which other modules' readers it calls, and counts them at this repository's size.

## Acceptance

- `productFacts` with the scope `all` reads the commit and tree once and the files in batches of a hundred. A committed
  test counts the requests at about 600 items and 400 job records.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
