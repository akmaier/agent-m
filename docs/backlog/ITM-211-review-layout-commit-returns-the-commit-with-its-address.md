---
id: ITM-211
title: reviewLayoutCommit returns the commit with its address
level: module
realises:
  - UC-001
modules:
  - MOD-artifact-edits
builds_on:
  - ITM-206
tests:
  - unit
origin:
  - UC-001
---
# ITM-211 reviewLayoutCommit returns the commit with its address

**REGISTER**

## Outcome

MOD-artifact-edits' `reviewLayoutCommit(host: Host)`, in `src/artifact-edits/`, as its file states it. It writes the
missing parts of the review layout into the default branch that `repositoryInfo` names, in one commit without a pull
request. The commit is made with the token the host was connected with, and its message names no one. It returns the
commit as the host's `commitFiles` returns it, `{ sha, url }`, with the parts written, so that UC-001 step 5 can show the
commit as a link; and `{ complete: true }` when nothing is missing.

## Acceptance

- Unit tests that name MOD-artifact-edits state, before the code changes:
  - `reviewLayoutCommit` takes the host alone;
  - it returns the commit's `sha` and `url` as the host's `commitFiles` returns them, with the parts written;
  - the commit's message names no one.
- The first commit holds only tests, and CI is red on it; every new test's counter-proof — a fault planted in the code it
  guards, and the test failing on it — is recorded in the pull request.
- The tests of ITM-206 that state the old signature or return, or a message naming the person, change with it. Each is
  named in the pull request with the expected result it changes.
- Only `src/artifact-edits/` and the tests that name MOD-artifact-edits change.
