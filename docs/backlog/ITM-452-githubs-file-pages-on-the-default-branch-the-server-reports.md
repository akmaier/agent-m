---
id: ITM-452
title: GitHub's file pages on the default branch the server reports
level: module
realises:
  - UC-006
  - UC-008
  - UC-018
  - WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
modules:
  - MOD-repository-hosts
builds_on:
  - ITM-310
tests:
  - unit
origin:
  - ITM-310, #365
  - MOD-repository-hosts, Interfaces: WebLinks, webLinks
---
# ITM-452 GitHub's file pages on the default branch the server reports

**REGISTER**

## Outcome

`webLinks`' `newFile` and `editFile` on the branch the repository's server reports as its default, `RepositoryInfo`'s
`defaultBranch`. Today (ITM-310) both are built on `main`, the model's default, so a repository whose default branch has
another name gets a page for a branch it does not have, and the fallback without a token fails there (UC-006 4b, UC-008
3b, UC-018 4a). The accepted texts leave no way to build it: MOD-repository-hosts' file gives `newFile` and `editFile` no
branch, `webLinks` makes no request, and a host keeps nothing beyond the texts of the blobs it has read, so `webLinks`
cannot know the default branch. The item needs a change of MOD-repository-hosts' file that gives the two pages the
default branch, for akmaier's acceptance; until then it cannot start.

## Acceptance

- Unit tests that name MOD-repository-hosts state, before the code exists: for a repository whose default branch is
  `master`, the new-file page and the editor page name `master`; for one whose default branch is `main`, they are the
  pages ITM-310's tests state; no request is made.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed; ITM-310's tests change at most how they prepare
  their fixture.
- Only `src/repository-hosts/` and the tests that name MOD-repository-hosts change.
