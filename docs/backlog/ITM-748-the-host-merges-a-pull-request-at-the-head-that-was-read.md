---
id: ITM-748
title: The host merges a pull request at the head that was read
level: module
realises:
  - UC-027
  - CODE ENTERS THE DEFAULT BRANCH THROUGH A PULL REQUEST WITH GREEN CI
  - A REMOTE INTERFACE NAMES HOW IT FAILS
  - ONE CLICK PER DECISION
modules:
  - MOD-repository-hosts
builds_on:
tests:
  - unit
origin:
  - akmaier's request of 2026-10-17 to implement UC-021 to UC-035
  - MOD-repository-hosts, Interfaces: mergePullRequest
---
# ITM-748 The host merges a pull request at the head that was read

**REGISTER**

## Outcome

MOD-repository-hosts' `mergePullRequest(number, expectedHead)`, as its file states it, on GitHub and on a GitLab
server. It merges only while the pull request's head is still `expectedHead`, and the server's branch protection stays
in force. UC-027 step 6 merges the schedule's pull request with one click through it (MOD-test-pages' Uses).
`src/repository-hosts/` has no such function, and no item names it. Through a clone without a token it throws
`NotSupported`, as `connect` states for every server function.

## Acceptance

- Against fixture servers for GitHub and GitLab: a merge at the expected head returns the merge commit. A moved head is
  `Moved`, with no merge request sent. A refusal by the server is `NotMergeable` with its reason. 401, 403 and 429
  are `TokenRefused`, `PermissionMissing` and `RateLimited`.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/repository-hosts/` and the tests that name MOD-repository-hosts change.
