---
id: ITM-205
title: The repository hosts for adding a product
level: module
realises:
  - UC-001
  - A PRODUCT IS NAMED BY ITS ADDRESS
  - GITLAB PRODUCTS ARE SUPPORTED
  - A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT
  - A USED-UP RATE LIMIT IS NAMED, NOT BLAMED ON THE TOKEN
modules:
  - MOD-repository-hosts
builds_on:
tests:
  - unit
origin:
  - UC-001
---
# ITM-205 The repository hosts for adding a product

## Outcome

MOD-repository-hosts' interface, as its file states it, for what UC-001 needs on GitHub and on a GitLab server:
`parseAddress`, `connect`, and the host's `repositoryInfo`, `readSnapshot`, `commitFiles` and `webLinks`, with the errors
the file names for them. The code that does this now, in `docs/assets/git-host.mjs`, moves into `src/repository-hosts/`;
the old file re-exports what the dashboard imports from it, so that the dashboard keeps working until its pages move.

## Acceptance

- Unit tests that name MOD-repository-hosts state, before the code exists, with the network replaced by recorded
  responses: the address of a GitHub and of a GitLab repository read as the browser shows it; a token sent only to the
  server that issued it; a `403` with a used-up rate limit named as that limit and not as the token; a write that a public
  repository refuses because the token does not reach it, named so, with nothing written; all files of a change written
  in one commit on the head that was read, and `Moved` when the head moved meanwhile; and the token pages UC-001 opens.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests of the Git host stay green, with no expected result changed.
- Only `src/repository-hosts/`, the tests that name MOD-repository-hosts and the re-exports in `docs/assets/git-host.mjs`
  change.
