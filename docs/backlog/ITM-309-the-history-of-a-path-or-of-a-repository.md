---
id: ITM-309
title: The history of a path or of a repository
level: module
realises:
  - UC-007
  - UC-008
  - UC-018
  - A CHANGED FILE IS SHOWN AGAINST ITS LAST ACCEPTED TEXT
  - A PERSON'S EDITS COLLECT IN ONE OPEN QUEUE
  - THE NAME IS THE ID AND IT SURVIVES
modules:
  - MOD-repository-hosts
builds_on:
  - ITM-205
  - ITM-247
tests:
  - unit
origin:
  - UC-007 step 5
  - UC-008 2a
  - UC-018 step 6
---
# ITM-309 The history of a path or of a repository

**REGISTER**

## Outcome

MOD-repository-hosts' `readHistory(path, { ref, limit })`, as its file states it, on the GitHub and the GitLab adapters:
the commits that changed a path — or, for a `null` path, the repository —, newest first, each a `HistoryEntry` with its
parents, its author's account and name, its date, its message and its changes — added, modified, deleted, and a rename
with the path it came from. Its failures are those of `readSnapshot`. MOD-approvals' `lastAcceptedText` (ITM-334),
MOD-spec-changes' `openQueueOf` (ITM-341) and the writer `open-files` (ITM-336) call it. The history through a local
clone is not part of this item.

## Acceptance

- Unit tests that name MOD-repository-hosts state, before the code exists, on recorded or constructed answers of
  GitHub's and GitLab's APIs: a file's commits newest first with their changes; a rename with its earlier path;
  `limit` honoured; the repository's history for a `null` path; a path no commit touched giving an empty list;
  `TokenRefused`, `NotFound`, `RateLimited` and `Unreachable` as `readSnapshot` names them. Nothing reaches the
  network.
- The first commit holds only these tests, and CI is red on it; every new test's counter-proof is recorded in the pull
  request.
- The existing tests stay green, with no expected result changed.
- Only `src/repository-hosts/` and the tests that name MOD-repository-hosts change.
