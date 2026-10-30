---
id: ITM-1291
title: The last accepted text is read in one request
level: module
realises:
  - A PAGE LOAD READS THE REPOSITORY IN BATCHES
modules:
  - MOD-approvals
builds_on:
  - ITM-1268
tests:
  - unit
origin:
  - po-opus-c's decision on ITM-1268's stop, docs/backlog/sprints/team1/111.md ("ITM-1268's stop: decided")
---
# ITM-1291 The last accepted text is read in one request

**REGISTER**

## Outcome

After ITM-1268 `lastAcceptedText` reads the file at the commit that added the record through
`readSnapshot(last.commit, { folders: [file] })`: the commit and one request for the folder's entries, then the file.
MOD-repository-hosts' `readFileAt(path, [commit])` reads one file at a commit in one request. With it,
`lastAcceptedText` reads the file in one request and compares its blob as it does now.

## The reading of the accepted text

`readFileAt` is a function of the Host: "`Host` — the object `connect` returns; the functions below, from `readSnapshot`
on, are its functions" (MOD-repository-hosts.md:111). MOD-approvals' Uses name `MOD-repository-hosts.Host`
(MOD-approvals.md:10), and `lastAcceptedText` is given the host. So it calls `host.readFileAt`, as it calls
`readSnapshot` and `readHistory` of the same object.

## Acceptance

- A unit case counts one request for the older file and none for its commit or a tree; it fails on the code as
  ITM-1268 leaves it.
- Only `src/approvals/` and its tests change, and the tests' fakes that the call reaches.
