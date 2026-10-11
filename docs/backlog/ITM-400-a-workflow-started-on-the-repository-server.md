---
id: ITM-400
title: A workflow started on the repository server
level: module
realises:
  - UC-004
  - A REMOTE INTERFACE NAMES HOW IT FAILS
  - A CREDENTIAL IS NEVER PLACED IN A URL
modules:
  - MOD-repository-hosts
builds_on:
  - ITM-311
tests:
  - unit
origin:
  - UC-004 7a
---
# ITM-400 A workflow started on the repository server

**REGISTER**

## Outcome

MOD-repository-hosts' `startWorkflow(workflow, ref, inputs)`, as its file states it, on GitHub and on GitLab: a workflow
or a pipeline started with its inputs, which hold no credential; the run where the server names it at once, else `null`
for the caller to find with `listCiRuns`; `PermissionMissing`, `TokenRefused`, `RateLimited`, `Unreachable` and
`NotSupported` by name. The library's *Fetch again* (ITM-402) calls it.

## Acceptance

- Unit tests that name MOD-repository-hosts state, before the code exists, with `fetch` replaced: the request each
  server receives; the run returned or `null`; each failure by name.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/repository-hosts/` and the tests that name MOD-repository-hosts change.
