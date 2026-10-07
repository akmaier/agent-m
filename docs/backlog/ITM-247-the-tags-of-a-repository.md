---
id: ITM-247
title: The tags of a repository
level: module
realises:
  - UC-013
  - A RELEASE IS TAGGED AND LOGGED
  - A VERSION IS NOT REWRITTEN
modules:
  - MOD-repository-hosts
builds_on:
tests:
  - unit
origin:
  - UC-013
---
# ITM-247 The tags of a repository

**REGISTER**

## Outcome

MOD-repository-hosts' `listTags` and `createTag`, as its file states them, in `src/repository-hosts/`, through GitHub's
and GitLab's REST APIs: the tags of a repository with their commits, optionally only those matching a pattern such as
`v*`; and a tag set on a commit, never moved, an existing tag refused with `TagExists` and its commit. A release
candidate and a release are tagged with them (MOD-release-evidence), and what waits for acceptance reads them (ITM-239).
The local clone is not part of this item. Nothing else of the module is part of this item.

## Acceptance

- Unit tests that name MOD-repository-hosts state, before the code exists, with GitHub and a GitLab server replaced by
  fakes: the tags with their commits, and only those of a pattern; a tag created on the commit named; an existing tag
  refused with `TagExists` naming its commit, and not moved; a refused token, a missing permission and a used-up rate
  limit named as the module's failures; the token sent only to the server that issued it.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof — a fault planted in the
  code it guards, and the test failing on it — is recorded in the pull request.
- The existing tests stay green, with no expected result changed.
- Only `src/repository-hosts/` and the tests that name MOD-repository-hosts change (`AN IMPLEMENTATION JOB CHANGES ONLY ITS
  MODULES`).
