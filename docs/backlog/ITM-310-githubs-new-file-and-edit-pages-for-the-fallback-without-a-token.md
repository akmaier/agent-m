---
id: ITM-310
title: GitHub's new-file and edit pages for the fallback without a token
level: module
realises:
  - UC-006
  - UC-008
  - UC-018
  - WITHOUT A TOKEN, GITHUB'S WEB INTERFACE IS THE FALLBACK
  - NO TEXT TRAVELS IN A URL
  - A CREDENTIAL IS NEVER PLACED IN A URL
modules:
  - MOD-repository-hosts
builds_on:
  - ITM-205
tests:
  - unit
origin:
  - UC-006 4b
  - UC-008 3b
  - UC-018 4a
---
# ITM-310 GitHub's new-file and edit pages for the fallback without a token

**REGISTER**

## Outcome

`webLinks`' `newFile(path, record)` and `editFile(path)`, as MOD-repository-hosts' file states them, in `web-links.mjs`:
on GitHub, the new-file page of the default branch prefilled with a path and at most an approval record, and the editor
page of a file; `newFile` is `null` on a GitLab server. A link never carries a reviewed text or a credential.
MOD-approvals' `fallbackAcceptLink` (ITM-333) and MOD-artifact-edits' `fallbackEditLinks` (ITM-335) call them.
`newFileUrl` and `editUrl` in `docs/assets/git-host.mjs` are the model and stay. The pages of CI secrets and runs
(ITM-311) and the other pages of `WebLinks` are not part of this item.

## Acceptance

- Unit tests that name MOD-repository-hosts state, before the code exists: a new-file page with a path and a
  three-line record, whose address holds both and nothing else; an edit page of a path with spaces; `newFile` null for
  a GitLab project. No request is made.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/repository-hosts/` and the tests that name MOD-repository-hosts change.
