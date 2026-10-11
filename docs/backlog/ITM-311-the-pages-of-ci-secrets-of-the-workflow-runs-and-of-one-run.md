---
id: ITM-311
title: The pages of CI secrets, of the workflow runs and of one run
level: module
realises:
  - UC-010
  - A HOSTED JOB AUTHENTICATES ITS AGENT WITH A CI SECRET
  - A HOSTED JOB WRITES WITH THE PERSON'S TOKEN FROM A CI SECRET
  - A CREDENTIAL IS NEVER PLACED IN A URL
modules:
  - MOD-repository-hosts
builds_on:
  - ITM-205
tests:
  - unit
origin:
  - UC-010 precondition and step 1
---
# ITM-311 The pages of CI secrets, of the workflow runs and of one run

**REGISTER**

## Outcome

`webLinks`' `secrets`, `actions` and `run(id)` for GitHub and GitLab, as MOD-repository-hosts' file states them, in
`web-links.mjs`: the repository's page for CI secrets, its page of workflow runs or pipelines, and one run's page, each
as the server documents it, read when it is built. The settings page opens the secrets page beside the names of UC-010's
two secrets and never asks for a value (ITM-351). Navigation only: no request, no credential in an address. `newFile`
and `editFile` (ITM-310), `pipelineSchedules`, `pagesSettings` and `fork` are not part of this item.

## Acceptance

- Unit tests that name MOD-repository-hosts state, before the code exists: for a GitHub and a GitLab address, each of
  the three addresses; none carries a token.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/repository-hosts/` and the tests that name MOD-repository-hosts change.
