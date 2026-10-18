---
id: ITM-928
title: GitLab's readHistory reads no commit's changes when told not to
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-repository-hosts
builds_on:
  - ITM-916
tests:
  - unit
origin:
  - developer-sonnet-c's finding on ITM-916's pull request #898 (sprint team1/90)
---
# ITM-928 GitLab's readHistory reads no commit's changes when told not to

**REGISTER**

## Outcome

GitLab's `readHistory` (`src/repository-hosts/gitlab.mjs:167-183`) ignores `changes: false` and reads every commit's diff,
against MOD-repository-hosts.md:179-182: "With `changes: false`, each entry's `changes` is empty and the history costs one
request per page of commits". ITM-916 fixes GitHub's adapter. This is the same sentence for the other adapter.

## Acceptance

- With `changes: false`, GitLab's `readHistory` sends one request per page of commits and returns empty `changes`. A test
  counts the requests over a counting fake, with a counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
