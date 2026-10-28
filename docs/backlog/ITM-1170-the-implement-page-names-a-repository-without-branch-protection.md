---
id: ITM-1170
title: The implement page names a repository without branch protection, with the server's page for it
level: module
realises:
  - UC-024
modules:
  - MOD-repository-hosts
  - MOD-implementation-pages
builds_on:
  - ITM-734
tests:
  - unit
origin:
  - the gate of #1267 (ITM-734, team 2's sprint 102), developer-sonnet-f's stop at UC-024 12a
---
# ITM-1170 The implement page names a repository without branch protection, with the server's page for it

**REGISTER**

## Outcome

UC-024 12a: "The repository has no branch protection. Agent M says that the server does not enforce 'merge only on
green' …, with the server's page for it" (`docs/use-cases/UC-024-*.md:225`).
- ITM-734 left 12a unbuilt rather than guess.
- The accepted texts now give it (approvals of MOD-repository-hosts blob `97901d8e` and MOD-implementation-pages blob
  `656ce73f`, `b6c70419`):
  - `RepositoryInfo.greenToMerge` (MOD-repository-hosts.md:148-153): whether the server refuses a merge into the default
    branch until its required checks have passed — on GitHub a branch protection or a ruleset, on GitLab "pipelines must
    succeed" —, `null` where the token may not read it;
  - `WebLinks.branchProtection` (:163-169), the page on which that rule is set;
  - the route `implement` (MOD-implementation-pages.md:191-192): where `greenToMerge` is false, it says that the server
    does not enforce "merge only on green", with the page `branchProtection`.
- The code has none of it: `src/repository-hosts/` and `src/implementation-pages/` name neither `greenToMerge` nor
  `branchProtection`.

## Acceptance

- With a fixture host whose default branch is unprotected, the route `implement` says that the server does not enforce the
  merge rule, and links the server's page for branch protection. With a protected one, it says nothing.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
