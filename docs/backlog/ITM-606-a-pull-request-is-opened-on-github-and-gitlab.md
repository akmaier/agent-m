---
id: ITM-606
title: A pull request is opened on GitHub and GitLab
level: module
realises:
  - CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
  - UC-024
modules:
  - MOD-repository-hosts
builds_on:
  - ITM-567
tests:
  - unit
origin:
  - ITM-567's gate (docs/gates/20261016-2229-development-release-testing-1dc6.md): `openPullRequest` throws NotSupported for every host (`src/repository-hosts/index.mjs:354`), "Its adapter for GitHub and GitLab is not built yet"
---
# ITM-606 A pull request is opened on GitHub and GitLab

**REGISTER**

## Outcome

MOD-repository-hosts' `openPullRequest(request: { branch, base, title, body, draft? }) -> Promise<PullRequest>` works
as its file states it:
- on GitHub, a pull request;
- on GitLab, a merge request;
- through a clone, `NotSupported` as now.

It fails with `TokenRefused`, `PermissionMissing`, `RateLimited`, `Unreachable` and `NotSupported`. Without it, the
writer `branch-and-pull-request` (ITM-567) opens nothing on a server.

## Acceptance

- Against a fixture GitHub and a fixture GitLab, the request carries the branch, the base, the title and the body, and
  the `PullRequest` returned has the server's number and address.
- Each failure is named beside a known positive.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
