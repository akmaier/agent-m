---
id: ITM-962
title: createIssue creates a product's issue on GitHub and GitLab
level: module
realises:
  - UC-038
  - A MAIL BECOMES AN ISSUE ONLY BY A PERSON'S CLICK
  - AN ISSUE FROM A MAIL IS A DEFECT OR A CHANGE
modules:
  - MOD-repository-hosts
builds_on:
tests:
  - unit
origin:
  - the gap analysis of UC-036 to UC-049 on main, proposal NEW-038-1, verified against the accepted texts on main at ee5d1364
  - akmaier's direction of 2026-10-18 ("fill the backlog to implement the remaining missing UC 36 to the end")
---
# ITM-962 createIssue creates a product's issue on GitHub and GitLab

**REGISTER**

## Outcome

MOD-repository-hosts.md:233-234 (blob `bfe2f9b4`, accepted): "`createIssue(issue: { title: string, body: string, labels:
string[] }) -> Promise<Issue>` — crosses the network; fails with `TokenRefused`, `PermissionMissing`, `RateLimited`,
`Unreachable`, `NotSupported`." UC-038:120-121: "Agent M creates the issue in the product's tracker with the author's
token, labelled `defect` or `change`".

`grep -n createIssue src/repository-hosts/*.mjs` finds nothing, while `createBranch` is found (`gitlab.mjs:358`).
ITM-581 builds `listIssues`, `commentOnIssue`, `setIssueLabels` and `setIssueState` (ITM-581:21), not `createIssue`.
ITM-952 calls it through a fake.

## Acceptance

- Unit tests that name MOD-repository-hosts, over a fixture GitHub and a fixture GitLab: the issue is created with its
  title, body and labels, and the returned `Issue` has the fields of MOD-repository-hosts.md:136-137.
- Each failure is named: `TokenRefused` (401), `PermissionMissing` (403 without rate-limit headers), `RateLimited` (403 with
  `X-RateLimit-Remaining: 0`), `Unreachable`, and `NotSupported` through a clone.
- The token goes only in the authorisation header to the issuing server (`A TOKEN GOES ONLY TO THE SERVER THAT ISSUED IT`).
- Counter-proof: a `createIssue` that drops the labels fails.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
- Only `src/repository-hosts/` and the tests that name MOD-repository-hosts change.
