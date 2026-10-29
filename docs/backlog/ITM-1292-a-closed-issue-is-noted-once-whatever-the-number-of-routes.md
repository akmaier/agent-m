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

## Acceptance

- A unit case runs the entry twice for one merged pull request, as two routes do, and finds one close and one note; it
  fails on the code as it stands.
- Only `src/issue-handling/`, `src/workflow-entries/` and their tests change.
