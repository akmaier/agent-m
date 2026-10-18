---
id: ITM-916
title: readHistory reads no commit's changes when told not to
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-repository-hosts
builds_on:
tests:
  - unit
origin:
  - developer-sonnet-a's finding on ITM-898's pull request #885 (sprint team1/89)
---
# ITM-916 readHistory reads no commit's changes when told not to

**REGISTER**

## Outcome

MOD-repository-hosts.md:179-182 states `readHistory`'s option: "With `changes: false`, each entry's `changes` is empty and
the history costs one request per page of commits". GitHub's `readHistory` (`src/repository-hosts/github.mjs:207-223`)
ignores the option and reads every commit's changes, one request per commit. `src/test-pages/runs.mjs:167` and `:217`
already pass `changes: false` and pay the full price. developer-sonnet-a found this on ITM-898's pull request #885
(sprint team1/89).

## Acceptance

- With `changes: false`, GitHub's `readHistory` sends one request per page of commits and returns empty `changes`. A test
  counts the requests over a counting fake, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
