---
id: ITM-434
title: The open and closed issues of a repository
level: module
realises:
  - UC-022
  - A REUSE DECISION RECORDS ITS DUE DILIGENCE
  - DUE DILIGENCE IS FETCHED, NOT RECALLED
modules:
  - MOD-repository-hosts
builds_on:
tests:
  - unit
origin:
  - UC-022 step 7
---
# ITM-434 The open and closed issues of a repository

**REGISTER**

## Outcome

MOD-repository-hosts' `issueCounts()`, as its file states it: the numbers of open and closed issues of the repository,
pull requests not counted and no issue listed — on GitHub through its search, on a GitLab server through the project's
issue statistics —, without a token where the repository is public. Errors: `RateLimited` — on GitHub with the limit
`search` —, `NotFound`, `TokenRefused`, `Unreachable`. MOD-reuse-facts' `registryFacts` calls it (ITM-435).

## Acceptance

- Unit tests that name MOD-repository-hosts state, before the code exists, with a fake server for each host: the two
  counts; pull requests not counted; the search limit named when it is used up; each error.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/repository-hosts/` and the tests that name MOD-repository-hosts change.
