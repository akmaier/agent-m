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
- MOD-implementation-pages' Uses name `webLinks` for "the server's page for branch protection"
  (MOD-implementation-pages.md:222-223).
- MOD-repository-hosts gives neither:
  - `RepositoryInfo` (MOD-repository-hosts.md:145-147) has no field telling whether the default branch is protected;
  - `WebLinks` (:153-160) has no page for it.
- ITM-734 left 12a unbuilt rather than guess.

So this item begins with a draft of MOD-repository-hosts for akmaier. It gives whether the default branch is protected,
on GitHub and on GitLab, and the server's page for its protection. Then the implement page names an unprotected repository
with that page.

## Acceptance

- With a fixture host whose default branch is unprotected, the route `implement` says that the server does not enforce the
  merge rule, and links the server's page for branch protection. With a protected one, it says nothing.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
