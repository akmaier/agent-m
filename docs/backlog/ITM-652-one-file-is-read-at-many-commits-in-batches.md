---
id: ITM-652
title: One file is read at many commits in batches
level: module
realises:
  - UC-020
  - A REQUIREMENT SHOWS ITS HISTORY
modules:
  - MOD-repository-hosts
builds_on:
tests:
  - unit
origin:
  - ITM-598's gate on pull request #697 (docs/gates/20261017-0634-development-release-testing-3c18.md)
---
# ITM-652 One file is read at many commits in batches

**REGISTER**

## Outcome

ITM-598 builds a requirement's history from `SPEC.md` at every commit that changed it. Through today's interface that
costs 4 requests per commit: on this repository, 380 per first opening of a requirement, 286 of them API calls on the
person's token.
- `readHistory` asks for each commit's changes, one request each.
- Each commit's text needs its own `readSnapshot`, which takes two requests, and then a read.

Without a token, 286 API calls exceed GitHub's 60 an hour, so the history cannot load at all. akmaier's report reads
"the five clicks burnt my token budget", and this is that cost.

The draft committed with ITM-598's gate gives MOD-repository-hosts two things:
- `readFileAt(path, commits)`: one file at many commits. With a token it reads one request per batch through the
  server's batch query, as `readMany` does. Without a token it reads the raw file outside the API.
- `readHistory(…, { changes: false })`: one request per page of commits.

It waits for akmaier's acceptance of that draft.

## Acceptance

- `readFileAt` returns the file's text at each commit, `null` where it does not exist, in one request per batch with a token and with no API request without one.
- `readHistory` with `changes: false` costs one request per page of commits, and its entries' `changes` are empty.
- The tests count the requests on GitHub's and GitLab's adapters.
- The first commit holds only the tests, and CI is red on it. No stub is committed.
