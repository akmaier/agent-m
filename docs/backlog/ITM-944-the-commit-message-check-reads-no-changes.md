---
id: ITM-944
title: The commit-message check reads no commit's changes
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-workflow-entries
builds_on:
  - ITM-916
tests:
  - unit
origin:
  - developer-sonnet-c's finding on ITM-929's pull request #910 (sprint team1/91)
---
# ITM-944 The commit-message check reads no commit's changes

**REGISTER**

## Outcome

**A lead, not measured.** `src/workflow-entries/product.mjs:100-101` reads `readHistory(null, { ref })` twice, over the
whole history of the repository at two commits, and uses only each entry's `.commit` and `.message`. Without
`changes: false`, every commit's files are read as well, one request per commit, since ITM-916 and ITM-928 made the option
work. Found by developer-sonnet-c on ITM-929's pull request #910 (sprint team1/91).

**First task:** count the requests of that check on a fixture with and without the option. If nothing is saved, the item
stops.

## Acceptance

- Both calls pass `changes: false`, and the count falls by one request per commit read. A test pins it, with a
  counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
