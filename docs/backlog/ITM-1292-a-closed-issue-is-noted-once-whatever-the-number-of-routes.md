---
id: ITM-1292
title: A closed issue is noted once, whatever the number of routes
level: module
realises:
  - UC-012
modules:
  - MOD-issue-handling
  - MOD-workflow-entries
builds_on:
  - ITM-583
  - ITM-1259
tests:
  - unit
origin:
  - developer-sonnet-l's release tests of ITM-1259 (PR #1394), open question 1, ruled by po-opus-c in docs/backlog/sprints/team1/111.md
---
# ITM-1292 A closed issue is noted once, whatever the number of routes

**REGISTER**

## Outcome

The generated job workflow has one writer job per route, on GitHub (`hosted`, `runner-gpu`) and on GitLab
(`agent-m-hosted`, `agent-m-runner-gpu`), and each runs `onPullRequestClosed` on a merge. `closeWithLinks`
(`src/issue-handling/classes.mjs`) does not read the issue's state, so an issue the merged pull request names gets one
"Closed with" note per route. An issue already closed with links to that pull request is left as it is: it is closed and
noted once.

## Not ready: a draft for akmaier

Leaving an issue "already closed with links to that pull request" as it is needs the issue's state and comments read
before the note. `closeWithLinks` writes with `commentOnIssue` and `setIssueState` alone. Neither MOD-issue-handling's
Uses (MOD-issue-handling.md:110-116) nor MOD-workflow-entries', which calls it (:57, :448), names a read of an issue such as
`MOD-repository-hosts.readIssue`.

So a draft names that read among the Uses of the module that makes it, with what it is read for. The item is built once
the draft is accepted.

## Acceptance

- A unit case runs the entry twice for one merged pull request, as two routes do, and finds one close and one note; it
  fails on the code as it stands.
- Only `src/issue-handling/`, `src/workflow-entries/` and their tests change.
