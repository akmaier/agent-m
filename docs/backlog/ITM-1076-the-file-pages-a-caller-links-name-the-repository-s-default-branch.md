---
id: ITM-1076
title: The file pages a caller links name the repository's default branch
level: module
realises:
  - UC-006
  - UC-008
  - UC-018
modules:
  - MOD-artifact-edits
builds_on:
  - ITM-452
tests:
  - unit
origin:
  - ITM-452's stop (sprint team1/93), from developer-sonnet-d's finding
---
# ITM-1076 The file pages a caller links name the repository's default branch

**REGISTER**

## Outcome

`connect` builds `webLinks`' new-file and editor pages on the default branch its credentials name, else `main` (ITM-452).
No caller passes the default branch. So `fallbackEditLinks` (MOD-artifact-edits.md:112) still links pages on `main`, and the
fallback without a token fails on a repository whose default branch has another name (UC-006 4b, UC-008 3b, UC-018 4a).

**First task:** read where each caller of `webLinks`' file pages connects its host, and whether the default branch it has
read (`RepositoryInfo`'s `defaultBranch`) can reach `connect` there through the modules' uses. Where it cannot, the item
stops and names what is missing.

## Acceptance

- `fallbackEditLinks` for a repository whose default branch is `master` links pages on `master`. A test shows it, with a
  counter-proof.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
