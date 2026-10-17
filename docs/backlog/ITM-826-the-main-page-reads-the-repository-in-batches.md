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

**Decided at its draft stop (sprint team1/77, 2026-10-17, po-opus).**
- **The scope `work` is batched in this item too.** It runs "before a hand-over starts"
  (`MOD-progress-measures.md:145-149`), and the draft counted 2,049 requests there with a token, with every gate record
  read by itself. It is the same function and the same read-ahead. Its count before and after is stated in a committed
  test.
- **The instance's `SPEC.md` and `participants.md`** are read in one batch.
- **Accepted readings:**
  - `Facts.results` is the test-results branch's snapshot, as `Facts` types it;
  - `requirements` are SPEC.md's names, or none without SPEC.md;
  - the tests are the TST paths of the graph.
- **The six sources** are built here. The other fields are ITM-843, and each that stays `"unknown"` is named in the pull
  request.
- **Without a token** the count is no gate of this item, since `A PAGE LOAD READS THE REPOSITORY IN BATCHES` speaks of a
  load with a token, and this item draws no page. The main page's own count without a token is ITM-842.
- **`catalogue` reading one by one** is MOD-model-catalogue's, ITM-841.
- **The headers of `facts.mjs` and `index.mjs`** say what holds after the change, without item history.
